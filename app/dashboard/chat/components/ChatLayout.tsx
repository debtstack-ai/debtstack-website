'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatMessages, { Message, ToolCallStatus } from './ChatMessages';
import { STARTER_PROMPTS, PROMPT_CATEGORIES, type StarterPrompt } from '@/lib/chat/prompts';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  totalCost: number;
}

interface WatchlistItem {
  ticker: string;
  name?: string;
  addedAt: string;
}

interface ChatLayoutProps {
  apiKey: string;
}

const STORAGE_KEY_HISTORY = 'debtstack_chat_history';
const STORAGE_KEY_WATCHLIST = 'debtstack_watchlist';
const MAX_SESSIONS = 50;
const MAX_WATCHLIST = 20;

function parseSuggestions(text: string): string[] {
  const match = text.match(/<!--suggestions:\[([\s\S]*?)\]-->/);
  if (!match) return [];
  try {
    return JSON.parse(`[${match[1]}]`);
  } catch {
    return [];
  }
}

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
}

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_WATCHLIST) || '[]');
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(items.slice(0, MAX_WATCHLIST)));
}

export default function ChatLayout({ apiKey }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistInput, setWatchlistInput] = useState('');
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setSessions(loadSessions());
    setWatchlist(loadWatchlist());
  }, []);

  // Save session whenever messages change
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages, totalCost: sessionCost }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [messages, sessionCost, currentSessionId]);

  const startNewChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setSessionCost(0);
    setCurrentSessionId(null);
    setIsStreaming(false);
  }, []);

  const loadSession = useCallback((session: ChatSession) => {
    if (abortRef.current) abortRef.current.abort();
    setMessages(session.messages);
    setSessionCost(session.totalCost);
    setCurrentSessionId(session.id);
    setIsStreaming(false);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });
    if (currentSessionId === sessionId) {
      startNewChat();
    }
  }, [currentSessionId, startNewChat]);

  const addToWatchlist = useCallback((ticker: string) => {
    const upper = ticker.toUpperCase().trim();
    if (!upper) return;
    setWatchlist((prev) => {
      if (prev.some((w) => w.ticker === upper)) return prev;
      const updated = [{ ticker: upper, addedAt: new Date().toISOString() }, ...prev];
      saveWatchlist(updated);
      return updated;
    });
    setWatchlistInput('');
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((w) => w.ticker !== ticker);
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      // Create session if needed
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        const newSession: ChatSession = {
          id: sessionId,
          title: text.slice(0, 50),
          messages: [],
          createdAt: new Date().toISOString(),
          totalCost: 0,
        };
        setSessions((prev) => {
          const updated = [newSession, ...prev];
          saveSessions(updated);
          return updated;
        });
        setCurrentSessionId(sessionId);
      }

      const userMessage: Message = { role: 'user', content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsStreaming(true);

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        toolCalls: [],
        suggestions: [],
      };

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            apiKey,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          assistantMessage.content = `Error: ${err.error || response.statusText}`;
          setMessages([...newMessages, assistantMessage]);
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          assistantMessage.content = 'Error: No response stream';
          setMessages([...newMessages, assistantMessage]);
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const dataLineIndex = lines.indexOf(line) + 1;
              // Skip — data is handled below
              void eventType;
              void dataLineIndex;
            }
            if (line.startsWith('data: ')) {
              const raw = line.slice(6);
              // Find the preceding event type
              const eventLine = lines
                .slice(0, lines.indexOf(line))
                .reverse()
                .find((l) => l.startsWith('event: '));
              const eventType = eventLine?.slice(7) || '';

              try {
                const payload = JSON.parse(raw);

                if (eventType === 'text') {
                  assistantMessage.content += payload.text;
                  assistantMessage.suggestions = parseSuggestions(
                    assistantMessage.content
                  );
                  setMessages([...newMessages, { ...assistantMessage }]);
                } else if (eventType === 'tool_call') {
                  const toolCall: ToolCallStatus = {
                    id: payload.id,
                    name: payload.name,
                    status: 'pending',
                  };
                  assistantMessage.toolCalls = [
                    ...(assistantMessage.toolCalls || []),
                    toolCall,
                  ];
                  setMessages([...newMessages, { ...assistantMessage }]);
                } else if (eventType === 'tool_result') {
                  assistantMessage.toolCalls = (
                    assistantMessage.toolCalls || []
                  ).map((tc) =>
                    tc.id === payload.id
                      ? {
                          ...tc,
                          status: payload.error ? 'error' : ('done' as const),
                          cost: payload.cost,
                          error: payload.error,
                        }
                      : tc
                  );
                  setMessages([...newMessages, { ...assistantMessage }]);
                } else if (eventType === 'done') {
                  setSessionCost((prev) => prev + (payload.totalCost || 0));
                } else if (eventType === 'error') {
                  assistantMessage.content +=
                    `\n\nError: ${payload.message}`;
                  setMessages([...newMessages, { ...assistantMessage }]);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled
        } else {
          const message = err instanceof Error ? err.message : 'Unknown error';
          assistantMessage.content = `Error: ${message}`;
          setMessages([...newMessages, { ...assistantMessage }]);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, currentSessionId, apiKey]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (!isStreaming) sendMessage(suggestion);
    },
    [isStreaming, sendMessage]
  );

  const filteredSessions = searchQuery
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  const groupedPrompts = STARTER_PROMPTS.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, StarterPrompt[]>
  );

  const sessionTitle =
    messages.length > 0
      ? messages.find((m) => m.role === 'user')?.content.slice(0, 50) || 'Chat'
      : 'New Chat';

  return (
    <div className="flex h-screen bg-[#EAECF0]">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={startNewChat}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              + New Chat
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
            />
          </div>

          {/* Sidebar content - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Chat history */}
            {filteredSessions.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  History
                </h3>
                <div className="space-y-1">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                        session.id === currentSessionId
                          ? 'bg-blue-50 text-[#2383e2]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => loadSession(session)}
                    >
                      <span className="flex-1 truncate">{session.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="hidden group-hover:block text-gray-400 hover:text-red-500 text-xs"
                        title="Delete chat"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt library */}
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Prompts
              </h3>
              <div className="space-y-1">
                {Object.entries(PROMPT_CATEGORIES).map(([key, cat]) => (
                  <div key={key}>
                    <button
                      onClick={() =>
                        setActivePromptCategory(
                          activePromptCategory === key ? null : key
                        )
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span>{cat.icon}</span>
                      <span className="flex-1 text-left">{cat.label}</span>
                      <span className="text-gray-400 text-xs">
                        {activePromptCategory === key ? '−' : '+'}
                      </span>
                    </button>
                    {activePromptCategory === key &&
                      groupedPrompts[key]?.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => sendMessage(prompt.prompt)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 ml-4 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-[#2383e2] transition"
                        >
                          <span>{prompt.icon}</span>
                          <span className="text-left truncate">
                            {prompt.label}
                          </span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Watchlist */}
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Watchlist
              </h3>
              <div className="flex gap-2 mb-2 px-1">
                <input
                  type="text"
                  value={watchlistInput}
                  onChange={(e) => setWatchlistInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addToWatchlist(watchlistInput);
                  }}
                  placeholder="Add ticker..."
                  maxLength={5}
                  className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none"
                />
                <button
                  onClick={() => addToWatchlist(watchlistInput)}
                  disabled={!watchlistInput.trim()}
                  className="px-2 py-1.5 rounded bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  +
                </button>
              </div>
              {watchlist.length > 0 ? (
                <div className="space-y-1">
                  {watchlist.map((item) => (
                    <div
                      key={item.ticker}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() =>
                        sendMessage(`Tell me about ${item.ticker}'s debt structure`)
                      }
                    >
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {item.ticker}
                      </span>
                      {item.name && (
                        <span className="flex-1 truncate text-xs text-gray-500">
                          {item.name}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(item.ticker);
                        }}
                        className="hidden group-hover:block text-gray-400 hover:text-red-500 text-xs"
                        title="Remove"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 px-1">
                  Add tickers for quick access
                </p>
              )}
            </div>
          </div>

          {/* Back to dashboard */}
          <div className="p-3 border-t border-gray-200">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            >
              <span>&larr;</span>
              <span>Dashboard</span>
            </a>
          </div>
        </aside>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-gray-900 truncate flex-1">
            {sessionTitle}
          </h1>
          {sessionCost > 0 && (
            <span className="text-xs text-gray-400 font-mono">
              API cost: ${sessionCost.toFixed(2)}
            </span>
          )}
        </header>

        {/* Messages */}
        <ChatMessages messages={messages} onSuggestionClick={handleSuggestionClick} />

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
