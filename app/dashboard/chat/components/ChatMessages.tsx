'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

const TOOL_LABELS: Record<string, string> = {
  search_companies: 'Searching companies',
  search_bonds: 'Searching bonds',
  resolve_bond: 'Resolving bond',
  get_guarantors: 'Finding guarantors',
  get_corporate_structure: 'Loading corporate structure',
  search_pricing: 'Fetching pricing data',
  search_documents: 'Searching documents',
  get_changes: 'Checking changes',
  web_search: 'Searching the web',
};

function ToolCallPill({ tool }: { tool: ToolCallStatus }) {
  const label = TOOL_LABELS[tool.name] || tool.name;

  if (tool.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {label}...
      </span>
    );
  }

  if (tool.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
        {label} — error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {label} (${tool.cost?.toFixed(2) ?? '0.00'})
    </span>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">DebtStack Chat</h2>
          <p className="text-gray-500 max-w-md">
            Ask questions about corporate debt structures, bond pricing, leverage ratios, and more.
            Powered by Claude + DebtStack API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-gray-900 text-white px-4 py-3 text-sm">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[80%] space-y-3">
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
                    <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 prose prose-sm max-w-none prose-table:text-sm prose-th:text-left prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => <CopyableTable>{children}</CopyableTable>,
                        }}
                      >
                        {msg.content.replace(/<!--suggestions:\[[\s\S]*?\]-->/, '')}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Suggested follow-ups */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => onSuggestionClick(s)}
                          className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
