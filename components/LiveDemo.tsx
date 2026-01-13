// components/LiveDemo.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

// Code content with syntax tokens for highlighting
const codeLines = [
  { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
  { tokens: [{ text: '', type: 'default' }] },
  { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
  { tokens: [{ text: '', type: 'default' }] },
  { tokens: [{ text: '# Get corporate debt structure', type: 'comment' }] },
  { tokens: [{ text: 'structure', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_structure', type: 'method' }, { text: '(', type: 'default' }, { text: '"TSLA"', type: 'string' }, { text: ')', type: 'default' }] },
];

// Flatten code for typing animation
const flattenCode = () => {
  const result: { char: string; type: string }[] = [];
  codeLines.forEach((line, lineIndex) => {
    line.tokens.forEach(token => {
      for (const char of token.text) {
        result.push({ char, type: token.type });
      }
    });
    if (lineIndex < codeLines.length - 1) {
      result.push({ char: '\n', type: 'default' });
    }
  });
  return result;
};

const flatCode = flattenCode();

// Token color mapping
const tokenColors: Record<string, string> = {
  keyword: 'text-purple-400',
  class: 'text-yellow-300',
  variable: 'text-blue-300',
  param: 'text-orange-300',
  string: 'text-green-400',
  comment: 'text-gray-500',
  method: 'text-blue-400',
  default: 'text-gray-300',
};

export default function LiveDemo() {
  const [charIndex, setCharIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [isLooping] = useState(true);

  // Reset animation
  const resetAnimation = useCallback(() => {
    setCharIndex(0);
    setStep(0);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isLooping) return;

    if (charIndex < flatCode.length) {
      const timeout = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 25);
      return () => clearTimeout(timeout);
    } else if (step === 0) {
      const timeout = setTimeout(() => setStep(1), 400);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, step, isLooping]);

  // Step progression for hierarchy
  useEffect(() => {
    if (!isLooping) return;

    if (step >= 1 && step < 5) {
      const timeout = setTimeout(() => setStep(prev => prev + 1), 500);
      return () => clearTimeout(timeout);
    } else if (step === 5) {
      const timeout = setTimeout(() => resetAnimation(), 6000);
      return () => clearTimeout(timeout);
    }
  }, [step, isLooping, resetAnimation]);

  // Render typed code with syntax highlighting
  const renderCode = () => {
    const typedChars = flatCode.slice(0, charIndex);
    const elements: React.ReactElement[] = [];
    let currentSpan: { chars: string; type: string } = { chars: '', type: '' };

    typedChars.forEach((item) => {
      if (item.type !== currentSpan.type) {
        if (currentSpan.chars) {
          elements.push(
            <span key={`span-${elements.length}`} className={tokenColors[currentSpan.type]}>
              {currentSpan.chars}
            </span>
          );
        }
        currentSpan = { chars: item.char, type: item.type };
      } else {
        currentSpan.chars += item.char;
      }
    });

    if (currentSpan.chars) {
      elements.push(
        <span key={`span-${elements.length}`} className={tokenColors[currentSpan.type]}>
          {currentSpan.chars}
        </span>
      );
    }

    return elements;
  };

  return (
    <section className="px-6 py-24 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-gray-400 text-lg">
            One API call. Complete debt structure.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Code Panel */}
          <div className="bg-[#0d1117] rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl shadow-black/50">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-gray-800/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27ca40]"></div>
              </div>
              <span className="ml-3 text-sm text-gray-500 font-mono">example.py</span>
            </div>

            {/* Code content */}
            <div className="p-6 font-mono text-sm leading-relaxed min-h-[280px]">
              <pre className="whitespace-pre-wrap">
                {renderCode()}
                <span className={`inline-block w-2 h-5 ml-0.5 bg-blue-400 ${charIndex < flatCode.length ? 'animate-pulse' : 'opacity-0'}`}></span>
              </pre>
            </div>
          </div>

          {/* Right: Visual Hierarchy */}
          <div className="bg-[#0d1117] rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl shadow-black/50 min-h-[280px]">
            {/* Header */}
            <div className="px-5 py-3 bg-[#161b22] border-b border-gray-800/80 flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">Corporate Structure</span>
              {step >= 1 && (
                <span className="animate-fadeIn text-xs font-mono text-gray-500">TSLA</span>
              )}
            </div>

            <div className="p-5">
              {step >= 1 ? (
                <div className="relative">
                  {/* Summary Stats Bar */}
                  <div className="animate-fadeIn mb-5 flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Tesla, Inc.</div>
                        <div className="text-xs text-gray-500">3 entities · 3 instruments</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">$8.5B</div>
                      <div className="text-xs text-gray-500">Total Debt</div>
                    </div>
                  </div>

                  {/* Org Chart */}
                  <div className="relative">
                    {/* Parent Entity */}
                    {step >= 2 && (
                      <div className="animate-fadeIn mb-3">
                        <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-950/80 to-blue-900/40 border border-blue-500/30 shadow-lg shadow-blue-500/5">
                          <div className="absolute -top-2 left-4">
                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-500 text-white rounded">Parent</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div>
                              <div className="font-semibold text-white">Tesla, Inc.</div>
                              <div className="text-xs text-blue-300/70 mt-0.5">Delaware · Public (NASDAQ)</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Direct Debt</div>
                              <div className="text-sm font-semibold text-blue-400">—</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Connector Lines SVG */}
                    {step >= 3 && (
                      <div className="animate-fadeIn flex justify-center my-2">
                        <svg width="200" height="24" className="text-gray-600">
                          <path d="M100 0 L100 8 L40 8 L40 24" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M100 8 L160 8 L160 24" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="100" cy="4" r="2" fill="currentColor" />
                        </svg>
                      </div>
                    )}

                    {/* Subsidiaries */}
                    <div className="grid grid-cols-2 gap-3">
                      {step >= 3 && (
                        <div className="animate-fadeIn">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/80 to-emerald-900/30 border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-white text-sm">Tesla Motors</div>
                                <div className="text-[10px] text-emerald-400/70">Subsidiary</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-emerald-400">$7.3B</div>
                              </div>
                            </div>

                            {step >= 4 && (
                              <div className="animate-fadeIn space-y-1.5 pt-2 border-t border-emerald-800/50">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">5.3% Notes &apos;25</span>
                                  <span className="text-gray-300 font-medium">$5.5B</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">2.0% Conv</span>
                                  <span className="text-gray-300 font-medium">$1.8B</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {step >= 3 && (
                        <div className="animate-fadeIn" style={{ animationDelay: '150ms' }}>
                          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-950/80 to-violet-900/30 border border-violet-500/30 shadow-lg shadow-violet-500/5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-white text-sm">Tesla Energy</div>
                                <div className="text-[10px] text-violet-400/70">Subsidiary</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-violet-400">$1.2B</div>
                              </div>
                            </div>

                            {step >= 4 && (
                              <div className="animate-fadeIn space-y-1.5 pt-2 border-t border-violet-800/50">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">Credit Facility</span>
                                  <span className="text-gray-300 font-medium">$1.2B</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer info */}
                    {step >= 5 && (
                      <div className="animate-fadeIn mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Guarantees verified
                        </span>
                        <span>·</span>
                        <span>Source: 10-K Filing</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[220px] flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-sm">Fetching structure...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
