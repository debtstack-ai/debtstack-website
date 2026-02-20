'use client';

import { useState, useRef, useCallback } from 'react';
import { SignUpButton } from '@clerk/nextjs';
import { STARTER_PROMPTS, PROMPT_CATEGORIES, type StarterPrompt } from '@/lib/chat/prompts';

export default function ChatPreview() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const signUpButtonRef = useRef<HTMLButtonElement>(null);

  const groupedPrompts = STARTER_PROMPTS.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, StarterPrompt[]>
  );

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 5;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  const triggerSignUp = useCallback(() => {
    setShowSignUpOverlay(true);
    // Programmatically click the hidden SignUpButton
    setTimeout(() => signUpButtonRef.current?.click(), 0);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    triggerSignUp();
  }, [inputValue, triggerSignUp]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex h-screen bg-[#EAECF0]" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
      {/* Hidden SignUpButton that we trigger programmatically */}
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard/chat">
        <button ref={signUpButtonRef} className="hidden" aria-hidden="true" />
      </SignUpButton>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={triggerSignUp}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              + New Chat
            </button>
            <input
              type="text"
              placeholder="Search chats..."
              disabled
              className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2] disabled:opacity-50"
            />
          </div>

          {/* Sidebar content - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Empty history placeholder */}
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                History
              </h3>
              <p className="text-xs text-gray-400 px-3 py-2">
                Sign in to save chat history
              </p>
            </div>

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
                        {activePromptCategory === key ? '\u2212' : '+'}
                      </span>
                    </button>
                    {activePromptCategory === key &&
                      groupedPrompts[key]?.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={triggerSignUp}
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

            {/* Watchlist placeholder */}
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Watchlist
              </h3>
              <p className="text-xs text-gray-400 px-1">
                Sign in to track tickers
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="p-3 border-t border-gray-200">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            >
              <span>&larr;</span>
              <span>Home</span>
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
            Hermes
          </h1>
        </header>

        {/* Empty state / welcome message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hermes</h2>
            <p className="text-gray-500 max-w-md">
              DebtStack&apos;s credit data assistant. Ask about debt structures, bond pricing, leverage ratios, covenants, and more.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Sign up to start chatting — $5 free credits included.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Hermes about debt structures, bonds, leverage..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
              style={{ lineHeight: '24px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="flex-shrink-0 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Enter to send, Shift+Enter for newline
          </p>
        </div>
      </div>

      {/* Sign-up overlay (shown briefly while Clerk modal opens) */}
      {showSignUpOverlay && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowSignUpOverlay(false)}
        />
      )}
    </div>
  );
}
