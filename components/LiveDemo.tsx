// components/LiveDemo.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Demo definitions
type DemoId = 'structure' | 'distressed' | 'covenants';

interface Demo {
  id: DemoId;
  title: string;
  codeLines: { tokens: { text: string; type: string }[] }[];
}

const demos: Demo[] = [
  {
    id: 'structure',
    title: 'Corporate Structure',
    codeLines: [
      { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: '# Get corporate debt structure', type: 'comment' }] },
      { tokens: [{ text: 'structure', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_structure', type: 'method' }, { text: '(', type: 'default' }, { text: '"TSLA"', type: 'string' }, { text: ')', type: 'default' }] },
    ],
  },
  {
    id: 'distressed',
    title: 'Distressed Screening',
    codeLines: [
      { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: '# Screen for structural subordination', type: 'comment' }] },
      { tokens: [{ text: 'telecoms', type: 'variable' }, { text: ' = ', type: 'default' }, { text: '["CHTR", "LUMN", "DISH"]', type: 'string' }] },
      { tokens: [{ text: 'risks', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'analyze_structural_risk', type: 'method' }, { text: '(', type: 'default' }, { text: 'telecoms', type: 'variable' }, { text: ')', type: 'default' }] },
    ],
  },
  {
    id: 'covenants',
    title: 'Covenant Monitor',
    codeLines: [
      { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: '# Monitor covenant headroom', type: 'comment' }] },
      { tokens: [{ text: 'airlines', type: 'variable' }, { text: ' = ', type: 'default' }, { text: '["AAL", "UAL", "DAL"]', type: 'string' }] },
      { tokens: [{ text: 'status', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'check_covenant_headroom', type: 'method' }, { text: '(', type: 'default' }, { text: 'airlines', type: 'variable' }, { text: ')', type: 'default' }] },
    ],
  },
];

// Flatten code for typing animation
const flattenCode = (codeLines: Demo['codeLines']) => {
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

// Structure Demo Component (existing Tesla demo)
function StructureDemo({ step }: { step: number }) {
  return (
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
  );
}

// Distressed Screening Demo Component
function DistressedDemo({ step }: { step: number }) {
  return (
    <div className="p-5">
      {step >= 1 ? (
        <div className="space-y-3">
          {/* Charter - LOW RISK */}
          {step >= 1 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/20 border-l-4 border-emerald-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Charter Communications</span>
                      <span className="text-xs text-gray-500">CHTR</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <div>Most debt at OpCo level</div>
                      <div>Guarantee coverage: <span className="text-emerald-400 font-medium">95%</span></div>
                      <div>Limited structural subordination</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🟢</span>
                      <span className="text-emerald-400 font-bold text-sm">LOW RISK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lumen - HIGH RISK */}
          {step >= 2 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 to-red-900/20 border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Lumen Technologies</span>
                      <span className="text-xs text-gray-500">LUMN</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <div>$20B debt at HoldCo level</div>
                      <div>Guarantee coverage: <span className="text-red-400 font-medium">35%</span></div>
                      <div>Structural sub: <span className="text-red-400 font-medium">65% at risk</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🔴</span>
                      <span className="text-red-400 font-bold text-sm">HIGH RISK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dish - MEDIUM RISK */}
          {step >= 3 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-amber-900/20 border-l-4 border-amber-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">DISH Network</span>
                      <span className="text-xs text-gray-500">DISH</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <div>$10B maturity wall 2025-2026</div>
                      <div>OpCo guarantees: <span className="text-amber-400 font-medium">45%</span></div>
                      <div>Refinancing pressure increasing</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🟡</span>
                      <span className="text-amber-400 font-bold text-sm">MEDIUM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insight Box */}
          {step >= 4 && (
            <div className="animate-fadeIn mt-4">
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30">
                <div className="flex gap-2 text-xs">
                  <span>💡</span>
                  <p className="text-blue-200/90">
                    <span className="font-semibold">Investment Insight:</span> LUMN bonds trading at 40¢/$ may have limited recovery due to structural subordination.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full min-h-[220px] flex items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-sm">Analyzing risk...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Covenant Monitor Demo Component
function CovenantsDemo({ step }: { step: number }) {
  return (
    <div className="p-5">
      {step >= 1 ? (
        <div className="space-y-3">
          {/* AAL - WARNING */}
          {step >= 1 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-amber-900/20 border border-amber-500/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">American Airlines</span>
                      <span className="text-xs text-gray-500">AAL</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="text-gray-400">Current Leverage</div>
                      <div className="text-white font-medium">5.8x</div>
                      <div className="text-gray-400">Covenant Threshold</div>
                      <div className="text-white font-medium">6.0x</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">3%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Headroom</div>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <span>🟡</span>
                      <span className="text-amber-400 font-semibold text-xs">WARNING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UAL - SAFE */}
          {step >= 2 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/20 border border-emerald-500/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">United Airlines</span>
                      <span className="text-xs text-gray-500">UAL</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="text-gray-400">Current Leverage</div>
                      <div className="text-white font-medium">4.2x</div>
                      <div className="text-gray-400">Covenant Threshold</div>
                      <div className="text-white font-medium">5.5x</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">31%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Headroom</div>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <span>🟢</span>
                      <span className="text-emerald-400 font-semibold text-xs">SAFE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DAL - SAFE */}
          {step >= 3 && (
            <div className="animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/20 border border-emerald-500/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Delta Air Lines</span>
                      <span className="text-xs text-gray-500">DAL</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="text-gray-400">Current Leverage</div>
                      <div className="text-white font-medium">3.1x</div>
                      <div className="text-gray-400">Covenant Threshold</div>
                      <div className="text-white font-medium">5.0x</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">61%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Headroom</div>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <span>🟢</span>
                      <span className="text-emerald-400 font-semibold text-xs">SAFE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Box */}
          {step >= 4 && (
            <div className="animate-fadeIn mt-4">
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30">
                <div className="flex gap-2 text-xs">
                  <span>🚨</span>
                  <p className="text-red-200/90">
                    <span className="font-semibold">Alert:</span> AAL nearing covenant breach threshold. Monitor Q3 earnings for potential restructuring risk.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full min-h-[220px] flex items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-sm">Checking covenants...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState<DemoId>('structure');
  const [charIndex, setCharIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);

  // Keep ref in sync
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Get current demo data
  const currentDemo = demos.find(d => d.id === activeDemo) || demos[0];
  const flatCode = flattenCode(currentDemo.codeLines);

  // Reset animation when demo changes
  const resetAnimation = useCallback(() => {
    setCharIndex(0);
    setStep(0);
  }, []);

  // Handle tab click
  const handleTabClick = (demoId: DemoId) => {
    setAutoRotate(false);
    setActiveDemo(demoId);
    resetAnimation();
  };

  // Typing animation
  useEffect(() => {
    if (charIndex < flatCode.length) {
      const timeout = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (step === 0 && charIndex >= flatCode.length) {
      const timeout = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, step, flatCode.length]);

  // Step progression
  useEffect(() => {
    if (step >= 1 && step < 5) {
      const delays = [500, 500, 700, 900];
      const timeout = setTimeout(() => setStep(prev => prev + 1), delays[step - 1] || 500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || step < 5) return;

    const timeout = setTimeout(() => {
      const currentIndex = demos.findIndex(d => d.id === activeDemo);
      const nextIndex = (currentIndex + 1) % demos.length;
      setActiveDemo(demos[nextIndex].id);
      resetAnimation();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [autoRotate, step, activeDemo, resetAnimation]);

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

  // Render active demo component
  const renderDemo = () => {
    switch (activeDemo) {
      case 'structure':
        return <StructureDemo step={step} />;
      case 'distressed':
        return <DistressedDemo step={step} />;
      case 'covenants':
        return <CovenantsDemo step={step} />;
      default:
        return <StructureDemo step={step} />;
    }
  };

  return (
    <section className="px-6 py-24 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-gray-400 text-lg">
            Structured credit data, ready for your AI agent.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-900/50 rounded-xl p-1 border border-gray-800 overflow-x-auto">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleTabClick(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeDemo === demo.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
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
            <div className="p-6 font-mono text-sm leading-relaxed min-h-[320px]">
              <pre className="whitespace-pre-wrap">
                {renderCode()}
                <span className={`inline-block w-2 h-5 ml-0.5 bg-blue-400 ${charIndex < flatCode.length ? 'animate-pulse' : 'opacity-0'}`}></span>
              </pre>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="bg-[#0d1117] rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl shadow-black/50 min-h-[320px]">
            {/* Header */}
            <div className="px-5 py-3 bg-[#161b22] border-b border-gray-800/80 flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">
                {activeDemo === 'structure' && 'Corporate Structure'}
                {activeDemo === 'distressed' && 'Risk Analysis'}
                {activeDemo === 'covenants' && 'Covenant Status'}
              </span>
              {step >= 1 && (
                <span className="animate-fadeIn text-xs font-mono text-gray-500">
                  {activeDemo === 'structure' && 'TSLA'}
                  {activeDemo === 'distressed' && '3 companies'}
                  {activeDemo === 'covenants' && '3 airlines'}
                </span>
              )}
            </div>

            {renderDemo()}
          </div>
        </div>

        {/* Auto-rotate indicator */}
        {autoRotate && (
          <div className="mt-6 flex justify-center">
            <span className="text-xs text-gray-600">
              Auto-rotating demos · Click a tab to stop
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
