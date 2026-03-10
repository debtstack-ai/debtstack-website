'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CopyableTable({ children }: { children: React.ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const table = tableRef.current;
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    const tsv = Array.from(rows)
      .map((row) =>
        Array.from(row.querySelectorAll('th, td'))
          .map((cell) => cell.textContent?.trim() ?? '')
          .join('\t')
      )
      .join('\n');

    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="relative my-3">
      <button
        onClick={handleCopy}
        className="absolute -top-2 right-0 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        {copied ? (
          <>
            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy table
          </>
        )}
      </button>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table ref={tableRef} className="chat-table">
          {children}
        </table>
      </div>
    </div>
  );
}

export interface ToolCallStatus {
  id: string;
  name: string;
  cost?: number;
  status: 'pending' | 'done' | 'error';
  error?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallStatus[];
  suggestions?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
  onSuggestionClick: (suggestion: string) => void;
}

// Credit analyst thinking out loud — short, natural, casual
const TOOL_QUIPS: Record<string, string[]> = {
  search_companies: [
    'pulling up the name...',
    'checking the cap structure...',
    'looking at leverage...',
    'running the screen...',
  ],
  search_bonds: [
    'pulling the bond list...',
    'checking the debt stack...',
    'looking at what\'s outstanding...',
    'scanning maturities...',
  ],
  resolve_bond: [
    'looking up that CUSIP...',
    'finding the issue...',
    'matching the identifier...',
  ],
  get_guarantors: [
    'checking the guarantee structure...',
    'looking at who guarantees this...',
    'tracing the guarantors...',
  ],
  get_corporate_structure: [
    'mapping the entity structure...',
    'looking at the sub stack...',
    'checking for structural sub...',
  ],
  search_pricing: [
    'pulling TRACE data...',
    'checking levels...',
    'grabbing latest prints...',
  ],
  search_documents: [
    'checking the filings...',
    'looking at the indenture...',
    'reading the footnotes...',
  ],
  get_changes: [
    'checking for changes...',
    'looking at recent activity...',
    'scanning for updates...',
  ],
  web_search: [
    'checking public sources...',
    'looking this up...',
  ],
  research_company: [
    'researching SEC filings...',
    'pulling the 10-K...',
    'extracting from EDGAR...',
  ],
};

function getToolQuip(toolName: string): string {
  const quips = TOOL_QUIPS[toolName];
  if (!quips || quips.length === 0) return toolName;
  return quips[Math.floor(Math.random() * quips.length)];
}

// Cache quips per tool call ID so they don't change on re-render
const quipCache = new Map<string, string>();

function ToolCallPill({ tool }: { tool: ToolCallStatus }) {
  if (!quipCache.has(tool.id)) {
    quipCache.set(tool.id, getToolQuip(tool.name));
  }
  const label = quipCache.get(tool.id)!;

  if (tool.status === 'pending') {
    return (
      <motion.span
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, backgroundColor: 'rgb(243 244 246)' }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-gray-500 text-xs italic"
      >
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {label}
      </motion.span>
    );
  }

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, backgroundColor: 'rgb(249 250 251)' }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-gray-400 text-xs italic"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {label}
    </motion.span>
  );
}

// Parse <!--request_coverage:{"ticker":"...","company_name":"..."}--> from message content
function parseCoverageRequest(content: string): { ticker: string; company_name: string } | null {
  const match = content.match(/<!--request_coverage:(.*?)-->/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function CoverageRequestButton({ ticker, companyName }: { ticker: string; companyName: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleRequest = useCallback(async () => {
    setStatus('loading');
    try {
      const resp = await fetch('/api/chat/request-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, companyName }),
      });
      if (resp.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [ticker, companyName]);

  if (status === 'success') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Coverage requested! We&apos;ll add {companyName || ticker} within 24-48 hours.
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleRequest}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm hover:bg-red-100 transition"
      >
        Failed to request. Try again.
      </button>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={status === 'loading'}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
    >
      {status === 'loading' ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Requesting...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Request Full Coverage for {companyName || ticker}
        </>
      )}
    </button>
  );
}

export default function ChatMessages({ messages, onSuggestionClick }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Medici</h2>
          <p className="text-gray-500 max-w-md">
            DebtStack&apos;s credit data assistant. Ask about debt structures, bond pricing, leverage ratios, covenants, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-[780px] mx-auto space-y-5">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-gray-100 text-gray-900 px-4 py-3 text-sm">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Tool call indicators */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.toolCalls.map((tool) => (
                      <ToolCallPill key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}

                {/* Message content */}
                {msg.content && (
                  <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h3:text-[15px] prose-h3:mt-5 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-gray-900 prose-strong:font-semibold prose-table:text-sm prose-th:text-left prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-hr:my-4 prose-hr:border-gray-200 prose-code:text-[13px] prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => <CopyableTable>{children}</CopyableTable>,
                      }}
                    >
                      {msg.content
                        .replace(/<!--suggestions:\[[\s\S]*?\]-->/, '')
                        .replace(/<!--request_coverage:.*?-->/, '')}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Coverage request button */}
                {msg.content && (() => {
                  const coverage = parseCoverageRequest(msg.content);
                  return coverage ? (
                    <CoverageRequestButton
                      ticker={coverage.ticker}
                      companyName={coverage.company_name}
                    />
                  ) : null;
                })()}

                {/* Suggested follow-ups */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestions.map((s, j) => (
                      <button
                        key={j}
                        onClick={() => onSuggestionClick(s)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
