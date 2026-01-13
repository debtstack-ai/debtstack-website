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
  const [isLooping, setIsLooping] = useState(true);

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
      // Code finished typing, start hierarchy animation
      const timeout = setTimeout(() => setStep(1), 400);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, step, isLooping]);

  // Step progression for hierarchy
  useEffect(() => {
    if (!isLooping) return;

    if (step >= 1 && step < 4) {
      const timeout = setTimeout(() => setStep(prev => prev + 1), 600);
      return () => clearTimeout(timeout);
    } else if (step === 4) {
      // Full animation complete, wait then restart
      const timeout = setTimeout(() => resetAnimation(), 6000);
      return () => clearTimeout(timeout);
    }
  }, [step, isLooping, resetAnimation]);

  // Render typed code with syntax highlighting
  const renderCode = () => {
    const typedChars = flatCode.slice(0, charIndex);
    const elements: React.ReactElement[] = [];
    let currentSpan: { chars: string; type: string } = { chars: '', type: '' };

    typedChars.forEach((item, index) => {
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
          <div className="bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27ca40]"></div>
              </div>
              <span className="ml-3 text-sm text-gray-500 font-mono">example.py</span>
            </div>

            {/* Code content */}
            <div className="p-5 font-mono text-sm leading-relaxed min-h-[200px]">
              <pre className="whitespace-pre-wrap">
                {renderCode()}
                <span className={`inline-block w-2 h-5 ml-0.5 bg-blue-400 ${charIndex < flatCode.length ? 'animate-pulse' : 'opacity-0'}`}></span>
              </pre>
            </div>
          </div>

          {/* Right: Visual Hierarchy */}
          <div className="bg-[#0d1117] rounded-xl border border-gray-800 p-5 lg:p-6 min-h-[200px]">
            {step >= 1 ? (
              <div className="space-y-4">
                {/* Holdco */}
                <div className="animate-fadeIn">
                  <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">Tesla, Inc.</div>
                        <div className="text-xs text-gray-400 mt-1">
                          <span className="text-blue-400">Holdco</span> · Delaware
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total Debt</div>
                        <div className="text-sm font-semibold text-blue-400">$0</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                {step >= 2 && (
                  <div className="animate-fadeIn flex justify-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-px bg-gray-700"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                      <div className="w-16 h-px bg-gray-700"></div>
                    </div>
                  </div>
                )}

                {/* Operating Companies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step >= 2 && (
                    <div className="animate-fadeIn">
                      <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white text-sm">Tesla Motors</div>
                            <div className="text-xs text-gray-400">
                              <span className="text-emerald-400">OpCo</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Debt</div>
                            <div className="text-sm font-semibold text-emerald-400">$7.3B</div>
                          </div>
                        </div>

                        {step >= 3 && (
                          <div className="animate-fadeIn space-y-2">
                            <div className="bg-black/30 rounded px-3 py-2 border border-gray-700/50">
                              <div className="text-xs text-gray-300">5.3% Senior Notes 2025</div>
                              <div className="text-xs text-gray-500">$5.5B</div>
                            </div>
                            <div className="bg-black/30 rounded px-3 py-2 border border-gray-700/50">
                              <div className="text-xs text-gray-300">2.0% Conv Notes</div>
                              <div className="text-xs text-gray-500">$1.8B</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step >= 3 && (
                    <div className="animate-fadeIn">
                      <div className="bg-gradient-to-r from-violet-900/40 to-violet-800/20 border border-violet-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white text-sm">Tesla Energy</div>
                            <div className="text-xs text-gray-400">
                              <span className="text-violet-400">OpCo</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Debt</div>
                            <div className="text-sm font-semibold text-violet-400">$1.2B</div>
                          </div>
                        </div>

                        {step >= 4 && (
                          <div className="animate-fadeIn space-y-2">
                            <div className="bg-black/30 rounded px-3 py-2 border border-gray-700/50">
                              <div className="text-xs text-gray-300">Credit Facility</div>
                              <div className="text-xs text-gray-500">$1.2B</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Guarantee indicator */}
                {step >= 4 && (
                  <div className="animate-fadeIn text-center pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      All subsidiaries guaranteed by Tesla, Inc.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <span className="text-sm">Fetching structure...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
