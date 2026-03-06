'use client';

import { useState, useRef, useCallback } from 'react';
import { SignUpButton } from '@clerk/nextjs';
import { STARTER_PROMPTS, PROMPT_CATEGORIES, type StarterPrompt } from '@/lib/chat/prompts';
import ChatShell from '@/app/dashboard/chat/components/ChatShell';

const PREVIEW_COMPANIES = [
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Telecommunications', leverage: '3.1x' },
  { ticker: 'F', name: 'Ford Motor Company', sector: 'Automotive', leverage: '5.2x' },
  { ticker: 'CCL', name: 'Carnival Corporation', sector: 'Leisure', leverage: '4.8x' },
  { ticker: 'BA', name: 'Boeing Company', sector: 'Aerospace & Defense', leverage: '—' },
  { ticker: 'GM', name: 'General Motors Company', sector: 'Automotive', leverage: '2.4x' },
];

export default function ChatPreview() {
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);
  const [previewSearchTab, setPreviewSearchTab] = useState<'companies' | 'bonds'>('companies');
  const [watchlistInput, setWatchlistInput] = useState('');
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
    <>
      {/* Hidden SignUpButton that we trigger programmatically */}
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard/chat">
        <button ref={signUpButtonRef} className="hidden" aria-hidden="true" />
      </SignUpButton>

      <ChatShell
        onNewChat={triggerSignUp}
        searchValue=""
        onSearchChange={() => {}}
        searchDisabled
        headerTitle="Medici"
        headerRight={
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
            $5.00 free credits
          </span>
        }
        sidebarContent={
          <>
            {/* Empty history placeholder */}
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                History
              </h3>
              <p className="text-xs text-gray-400 px-3 py-2">
                Sign in to save chat history
              </p>
            </div>

            {/* DataSearch preview */}
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Search Data
              </h3>

              {/* Tab toggle */}
              <div className="flex gap-1 mb-2 px-1">
                <button
                  onClick={() => setPreviewSearchTab('companies')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                    previewSearchTab === 'companies'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => setPreviewSearchTab('bonds')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                    previewSearchTab === 'bonds'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Bonds
                </button>
              </div>

              {previewSearchTab === 'companies' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Search by ticker or name..."
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 mb-2 disabled:opacity-50"
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                    {PREVIEW_COMPANIES.map((company) => (
                      <button
                        key={company.ticker}
                        onClick={triggerSignUp}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-[#2383e2] transition"
                      >
                        <span className="font-mono text-xs font-semibold text-gray-900 w-12 flex-shrink-0">
                          {company.ticker}
                        </span>
                        <span className="flex-1 text-xs text-gray-600 truncate">
                          {company.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                          {company.leverage}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Enter ticker (e.g. RIG)..."
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 mb-2 font-mono disabled:opacity-50"
                  />
                  <p className="px-3 py-2 text-xs text-gray-400">
                    Sign in to search bonds
                  </p>
                </div>
              )}
            </div>

            {/* Watchlist preview */}
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
                    if (e.key === 'Enter') triggerSignUp();
                  }}
                  placeholder="Add ticker..."
                  maxLength={5}
                  className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none"
                />
                <button
                  onClick={triggerSignUp}
                  className="px-2 py-1.5 rounded bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400 px-1">
                Add tickers for quick access
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
          </>
        }
        sidebarFooter={
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <span>&larr;</span>
            <span>Home</span>
          </a>
        }
      >
        {/* Empty state / welcome message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Medici</h2>
            <p className="text-gray-500 max-w-md">
              DebtStack&apos;s credit data assistant. Ask about debt structures, bond pricing, leverage ratios, covenants, and more.
            </p>
            <button
              onClick={triggerSignUp}
              className="mt-6 px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Sign up to start chatting
            </button>
            <p className="text-sm text-gray-400 mt-3">
              $5 free credits included — no credit card required.
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
              placeholder="Ask Medici about debt structures, bonds, leverage..."
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
      </ChatShell>

      {/* Sign-up overlay (shown briefly while Clerk modal opens) */}
      {showSignUpOverlay && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowSignUpOverlay(false)}
        />
      )}
    </>
  );
}
