'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatMessages, { Message, ToolCallStatus } from './ChatMessages';
import ChatShell from './ChatShell';
import DataSearch from './DataSearch';
import {
  fetchSessionList,
  fetchSession,
  saveSession as saveSessionRemote,
  deleteSessionRemote,
  migrateFromLocalStorage,
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace as deleteWorkspaceRemote,
  type Workspace,
} from '@/lib/chat/session-storage';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  totalCost: number;
  workspaceId: string | null;
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
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    // Backfill workspaceId for sessions saved before workspaces existed
    return raw.map((s: ChatSession & { workspaceId?: string | null }) => ({
      ...s,
      workspaceId: s.workspaceId ?? null,
    }));
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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistInput, setWatchlistInput] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const serverAvailableRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage immediately, then sync with server
  useEffect(() => {
    setSessions(loadSessions());
    setWatchlist(loadWatchlist());

    // Fetch server sessions and workspaces in parallel
    Promise.all([
      fetchSessionList(),
      fetchWorkspaces(),
    ])
      .then(async ([serverSessions, serverWorkspaces]) => {
        setWorkspaces(serverWorkspaces);

        // If server has sessions, use them as source of truth for the sidebar
        if (serverSessions.length > 0) {
          const localSessions = loadSessions();
          // Merge: server sessions take priority, keep any local-only sessions
          const serverIds = new Set(serverSessions.map((s) => s.id));
          const localOnly = localSessions.filter((s) => !serverIds.has(s.id));
          const merged: ChatSession[] = [
            ...serverSessions.map((s) => ({
              id: s.id,
              title: s.title,
              messages: [], // loaded on click
              createdAt: s.created_at,
              totalCost: s.total_cost,
              workspaceId: s.workspace_id,
            })),
            ...localOnly,
          ];
          setSessions(merged);
        } else {
          // Server empty — run migration from localStorage
          await migrateFromLocalStorage();
        }
      })
      .catch(() => {
        // Server unavailable — stay with localStorage
        serverAvailableRef.current = false;
      });
  }, []);

  // Debounced server save helper
  const debouncedServerSave = useCallback(
    (session: ChatSession) => {
      if (!serverAvailableRef.current) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveSessionRemote({
          id: session.id,
          title: session.title,
          messages: session.messages,
          totalCost: session.totalCost,
          createdAt: session.createdAt,
          workspaceId: session.workspaceId,
        }).catch(() => {
          // Silent failure — localStorage is the fallback
        });
      }, 1000);
    },
    []
  );

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
      // Debounced server save
      const current = updated.find((s) => s.id === currentSessionId);
      if (current) debouncedServerSave(current);
      return updated;
    });
  }, [messages, sessionCost, currentSessionId, debouncedServerSave]);

  const startNewChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setSessionCost(0);
    setCurrentSessionId(null);
    setIsStreaming(false);
  }, []);

  const loadSession = useCallback(async (session: ChatSession) => {
    if (abortRef.current) abortRef.current.abort();
    setIsStreaming(false);
    setCurrentSessionId(session.id);

    // If messages are loaded (from localStorage), use them immediately
    if (session.messages.length > 0) {
      setMessages(session.messages);
      setSessionCost(session.totalCost);
      return;
    }

    // Otherwise fetch from server (lazy load)
    if (serverAvailableRef.current) {
      try {
        const full = await fetchSession(session.id);
        const msgs = full.messages || [];
        setMessages(msgs);
        setSessionCost(full.total_cost);
        // Update local cache
        setSessions((prev) => {
          const updated = prev.map((s) =>
            s.id === session.id ? { ...s, messages: msgs, totalCost: full.total_cost, workspaceId: full.workspace_id } : s
          );
          saveSessions(updated);
          return updated;
        });
      } catch {
        setMessages([]);
        setSessionCost(0);
      }
    } else {
      setMessages([]);
      setSessionCost(0);
    }
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
    // Delete from server (fire-and-forget)
    if (serverAvailableRef.current) {
      deleteSessionRemote(sessionId).catch(() => {});
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
          workspaceId: activeWorkspaceId,
        };
        setSessions((prev) => {
          const updated = [newSession, ...prev];
          saveSessions(updated);
          return updated;
        });
        setCurrentSessionId(sessionId);
        // Save new session to server (fire-and-forget)
        if (serverAvailableRef.current) {
          saveSessionRemote({
            id: newSession.id,
            title: newSession.title,
            messages: [],
            totalCost: 0,
            createdAt: newSession.createdAt,
            workspaceId: newSession.workspaceId,
          }).catch(() => {});
        }
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
    [messages, isStreaming, currentSessionId, apiKey, activeWorkspaceId]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (!isStreaming) sendMessage(suggestion);
    },
    [isStreaming, sendMessage]
  );

  const handleCreateWorkspace = useCallback(async (name: string) => {
    if (!name.trim() || !serverAvailableRef.current) return;
    try {
      const ws = await createWorkspace(name.trim());
      setWorkspaces((prev) => [ws, ...prev]);
      setActiveWorkspaceId(ws.id);
      setShowNewWorkspace(false);
      setNewWorkspaceName('');
    } catch {
      // Silent failure
    }
  }, []);

  const handleDeleteWorkspace = useCallback(async (wsId: string) => {
    if (!serverAvailableRef.current) return;
    const ws = workspaces.find((w) => w.id === wsId);
    if (!window.confirm(`Delete workspace "${ws?.name || 'Untitled'}"? Sessions will be moved to uncategorized.`)) return;
    try {
      await deleteWorkspaceRemote(wsId);
      setWorkspaces((prev) => prev.filter((w) => w.id !== wsId));
      // Unassign sessions from this workspace locally
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.workspaceId === wsId ? { ...s, workspaceId: null } : s
        );
        saveSessions(updated);
        return updated;
      });
      if (activeWorkspaceId === wsId) setActiveWorkspaceId(null);
    } catch {
      // Silent failure
    }
  }, [activeWorkspaceId, workspaces]);

  const handleMoveSession = useCallback((sessionId: string, workspaceId: string | null) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, workspaceId } : s
      );
      saveSessions(updated);
      // Update workspace_id on server without overwriting messages
      if (serverAvailableRef.current) {
        const pool_query = async () => {
          const res = await fetch('/api/chat-sessions/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, workspace_id: workspaceId }),
          });
          if (!res.ok) throw new Error('Failed to move session');
        };
        pool_query().catch(() => {});
      }
      return updated;
    });
  }, []);

  // Filter sessions by search and active workspace
  const filteredSessions = sessions.filter((s) => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeWorkspaceId !== null && s.workspaceId !== activeWorkspaceId) {
      return false;
    }
    return true;
  });

  const sessionTitle =
    messages.length > 0
      ? messages.find((m) => m.role === 'user')?.content.slice(0, 50) || 'Medici'
      : 'Medici';

  return (
    <ChatShell
      onNewChat={startNewChat}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      headerTitle={sessionTitle}
      headerRight={
        sessionCost > 0 ? (
          <span className="text-xs text-gray-400 font-mono">
            API cost: ${(Number(sessionCost) || 0).toFixed(2)}
          </span>
        ) : undefined
      }
      sidebarContent={
        <>
          {/* Workspace selector */}
          <div className="px-3 pt-3 pb-1">
            {workspaces.length > 0 ? (
              <>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  Workspaces
                </h3>
                <div className="flex flex-wrap gap-1 mb-1">
                  <button
                    onClick={() => setActiveWorkspaceId(null)}
                    className={`px-2 py-1 rounded text-xs transition ${
                      activeWorkspaceId === null
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className={`group/ws relative px-2 py-1 rounded text-xs transition ${
                        activeWorkspaceId === ws.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={ws.color ? { borderLeft: `3px solid ${ws.color}` } : undefined}
                    >
                      {ws.name}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(ws.id);
                        }}
                        className="hidden group-hover/ws:inline ml-1 text-gray-400 hover:text-red-500 cursor-pointer"
                        title="Delete workspace"
                      >
                        x
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNewWorkspace(true)}
                    className="px-2 py-1 rounded text-xs bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    title="New workspace"
                  >
                    +
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition px-1"
              >
                + Create workspace
              </button>
            )}
            {showNewWorkspace && (
              <div className="flex gap-1 mt-1 px-1">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateWorkspace(newWorkspaceName);
                    if (e.key === 'Escape') {
                      setShowNewWorkspace(false);
                      setNewWorkspaceName('');
                    }
                  }}
                  placeholder="Workspace name..."
                  autoFocus
                  className="flex-1 px-2 py-1 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none"
                />
                <button
                  onClick={() => handleCreateWorkspace(newWorkspaceName)}
                  disabled={!newWorkspaceName.trim()}
                  className="px-2 py-1 rounded bg-gray-900 text-white text-xs disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Chat history */}
          {filteredSessions.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {activeWorkspaceId ? workspaces.find((w) => w.id === activeWorkspaceId)?.name || 'History' : 'History'}
              </h3>
              <div className="space-y-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-xs transition ${
                      session.id === currentSessionId
                        ? 'bg-blue-50 text-[#2383e2]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => loadSession(session)}
                  >
                    <span className="flex-1 truncate">{session.title}</span>
                    {/* Move to workspace */}
                    {workspaces.length > 0 && (
                      <select
                        value={session.workspaceId || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleMoveSession(session.id, e.target.value || null);
                        }}
                        className="hidden group-hover:block w-14 h-5 text-[10px] bg-gray-100 text-gray-500 rounded border-0 cursor-pointer px-0.5"
                        title="Move to workspace"
                      >
                        <option value="">None</option>
                        {workspaces.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name}
                          </option>
                        ))}
                      </select>
                    )}
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

          {/* Company & Bond search */}
          <DataSearch
            apiKey={apiKey}
            onSelect={(message) => sendMessage(message)}
          />

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
        </>
      }
      sidebarFooter={
        <a
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
        >
          <span>&larr;</span>
          <span>Dashboard</span>
        </a>
      }
    >
      {/* Messages */}
      <ChatMessages messages={messages} onSuggestionClick={handleSuggestionClick} />

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        onStop={isStreaming ? () => abortRef.current?.abort() : undefined}
      />
    </ChatShell>
  );
}
