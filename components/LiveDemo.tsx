// components/LiveDemo.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Demo definitions
type DemoId = 'structure' | 'maturity' | 'yields';

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
      { tokens: [{ text: 'structure', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_structure', type: 'method' }, { text: '(', type: 'default' }, { text: '"CHTR"', type: 'string' }, { text: ')', type: 'default' }] },
    ],
  },
  {
    id: 'maturity',
    title: 'Maturity Wall',
    codeLines: [
      { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: '# Get debt maturity schedule', type: 'comment' }] },
      { tokens: [{ text: 'maturities', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_maturity_wall', type: 'method' }, { text: '(', type: 'default' }, { text: '"CHTR"', type: 'string' }, { text: ')', type: 'default' }] },
    ],
  },
  {
    id: 'yields',
    title: 'Bond Yields',
    codeLines: [
      { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
      { tokens: [{ text: '', type: 'default' }] },
      { tokens: [{ text: '# Compare yields across capital structure', type: 'comment' }] },
      { tokens: [{ text: 'yields', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_bond_yields', type: 'method' }, { text: '(', type: 'default' }, { text: '"CHTR"', type: 'string' }, { text: ')', type: 'default' }] },
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

// Token color mapping (kept dark for code editor)
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

// Structure Demo Component - CHTR (Charter Communications)
function StructureDemo({ step }: { step: number }) {
  return (
    <div className="p-5">
      {step >= 1 ? (
        <div className="relative">
          {/* Summary Stats Bar */}
          <div className="animate-fadeIn mb-5 flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">Charter Communications</div>
                <div className="text-xs text-gray-400">10 entities · 16 instruments</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">$97B</div>
              <div className="text-xs text-gray-400">Total Debt</div>
            </div>
          </div>

          {/* Org Chart */}
          <div className="relative">
            {/* Parent Entity */}
            {step >= 2 && (
              <div className="animate-fadeIn mb-3">
                <div className="relative p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-600 text-white rounded">HoldCo</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <div className="font-semibold text-gray-900">Charter Communications, Inc.</div>
                      <div className="text-xs text-blue-600/70 mt-0.5">Delaware · Public (NASDAQ)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Direct Debt</div>
                      <div className="text-sm font-semibold text-blue-600">$56.3B</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connector Line to Intermediate HoldCo */}
            {step >= 3 && (
              <div className="animate-fadeIn flex justify-center my-2">
                <svg width="200" height="20" className="text-gray-300">
                  <path d="M100 0 L100 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="100" cy="4" r="2" fill="currentColor" />
                </svg>
              </div>
            )}

            {/* Intermediate HoldCo - CCO Holdings */}
            {step >= 3 && (
              <div className="animate-fadeIn mb-3">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-600 text-white rounded">Intermediate</span>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">CCO Holdings, LLC</div>
                      <div className="text-[10px] text-amber-600/70">Intermediate HoldCo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-amber-600">$27.3B</div>
                    </div>
                  </div>

                  {step >= 4 && (
                    <div className="animate-fadeIn space-y-1.5 pt-2 border-t border-amber-200/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Sr Unsecured Notes</span>
                        <span className="text-gray-700 font-medium">$27.3B</span>
                      </div>
                      <div className="text-[10px] text-amber-600/70">Guarantor for OpCo debt</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connector Line to OpCo */}
            {step >= 4 && (
              <div className="animate-fadeIn flex justify-center my-2">
                <svg width="200" height="20" className="text-gray-300">
                  <path d="M100 0 L100 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {/* OpCo - Charter Operating */}
            {step >= 4 && (
              <div className="animate-fadeIn">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-600 text-white rounded">OpCo</span>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Charter Operating, LLC</div>
                      <div className="text-[10px] text-emerald-600/70">Operating Company</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">$13.5B</div>
                    </div>
                  </div>

                  {step >= 5 && (
                    <div className="animate-fadeIn space-y-1.5 pt-2 border-t border-emerald-200/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Term Loans A/B</span>
                        <span className="text-gray-700 font-medium">$9.7B</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Secured Notes</span>
                        <span className="text-gray-700 font-medium">$3.8B</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="h-full min-h-[220px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-sm">Fetching structure...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Maturity Wall Demo Component - CHTR
function MaturityWallDemo({ step }: { step: number }) {
  const maturities = [
    { year: 2025, amount: 3.2, secured: 1.5, unsecured: 1.7 },
    { year: 2026, amount: 8.5, secured: 2.1, unsecured: 6.4 },
    { year: 2027, amount: 12.8, secured: 3.2, unsecured: 9.6 },
    { year: 2028, amount: 15.2, secured: 4.8, unsecured: 10.4 },
    { year: 2029, amount: 11.3, secured: 2.9, unsecured: 8.4 },
    { year: '2030+', amount: 46.0, secured: 0, unsecured: 46.0 },
  ];
  const maxAmount = 46;

  return (
    <div className="p-5">
      {step >= 1 ? (
        <div className="relative">
          {/* Summary Stats Bar */}
          <div className="animate-fadeIn mb-5 flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-gray-900 font-semibold">Charter Communications</div>
                <div className="text-xs text-gray-400">CHTR · 16 instruments</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">$97B</div>
              <div className="text-xs text-gray-400">Total Debt</div>
            </div>
          </div>

          {/* Maturity Wall Chart */}
          <div className="space-y-2">
            {maturities.map((item, index) => (
              step >= index + 1 && (
                <div key={item.year} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-xs text-gray-400 font-mono">{item.year}</div>
                    <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden flex">
                      {/* Secured portion */}
                      {item.secured > 0 && (
                        <div
                          className="h-full bg-blue-500 flex items-center justify-end pr-1"
                          style={{ width: `${(item.secured / maxAmount) * 100}%` }}
                        >
                          {item.secured >= 2 && (
                            <span className="text-[10px] text-white font-medium">${item.secured}B</span>
                          )}
                        </div>
                      )}
                      {/* Unsecured portion */}
                      <div
                        className="h-full bg-amber-500 flex items-center justify-end pr-2"
                        style={{ width: `${(item.unsecured / maxAmount) * 100}%` }}
                      >
                        {item.unsecured >= 3 && (
                          <span className="text-[10px] text-white font-medium">${item.unsecured}B</span>
                        )}
                      </div>
                    </div>
                    <div className="w-14 text-right">
                      <span className="text-sm font-semibold text-gray-900">${item.amount}B</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Legend */}
          {step >= 4 && (
            <div className="animate-fadeIn mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-500">Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500"></div>
                <span className="text-gray-500">Unsecured</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="h-full min-h-[220px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-sm">Loading maturities...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Bond Yields Demo Component - CHTR across capital structure
function BondYieldsDemo({ step }: { step: number }) {
  return (
    <div className="p-4">
      {step >= 1 ? (
        <div className="relative flex gap-4">
          {/* Left: Mini Corporate Structure */}
          <div className="w-[140px] flex-shrink-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 text-center">Structure</div>

            {/* HoldCo */}
            {step >= 1 && (
              <div className="animate-fadeIn">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <div className="text-[9px] text-blue-600 font-semibold uppercase">HoldCo</div>
                  <div className="text-[10px] text-gray-900 font-medium mt-0.5">Charter Comm</div>
                  <div className="text-[10px] text-red-500 font-semibold">6.89%</div>
                </div>
              </div>
            )}

            {/* Connector */}
            {step >= 2 && (
              <div className="animate-fadeIn flex justify-center">
                <svg width="2" height="12" className="text-gray-300">
                  <path d="M1 0 L1 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {/* Intermediate */}
            {step >= 2 && (
              <div className="animate-fadeIn">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <div className="text-[9px] text-amber-600 font-semibold uppercase">Intermediate</div>
                  <div className="text-[10px] text-gray-900 font-medium mt-0.5">CCO Holdings</div>
                  <div className="text-[10px] text-amber-600 font-semibold">5.87-6.24%</div>
                </div>
              </div>
            )}

            {/* Connector */}
            {step >= 3 && (
              <div className="animate-fadeIn flex justify-center">
                <svg width="2" height="12" className="text-gray-300">
                  <path d="M1 0 L1 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            {/* OpCo */}
            {step >= 3 && (
              <div className="animate-fadeIn">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-[9px] text-emerald-600 font-semibold uppercase">OpCo</div>
                  <div className="text-[10px] text-gray-900 font-medium mt-0.5">Charter Operating</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">5.12%</div>
                </div>
              </div>
            )}

            {/* Arrow indicator */}
            {step >= 4 && (
              <div className="animate-fadeIn mt-3 text-center">
                <div className="text-[9px] text-gray-400">Recovery Priority</div>
                <div className="text-lg text-gray-300">&uarr;</div>
                <div className="text-[9px] text-emerald-600">Higher</div>
              </div>
            )}
          </div>

          {/* Right: Bond Details */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Bond Yields</div>

            <div className="space-y-2">
              {/* OpCo Bond */}
              {step >= 3 && (
                <div className="animate-fadeIn p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Sr Secured &apos;29</div>
                      <div className="text-[9px] text-gray-400">Charter Operating</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">5.12%</div>
                      <div className="text-[9px] text-gray-400">+142 bps</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Intermediate Bonds */}
              {step >= 4 && (
                <div className="animate-fadeIn p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-amber-600 font-semibold">Sr Unsecured &apos;29</div>
                      <div className="text-[9px] text-gray-400">CCO Holdings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600">5.87%</div>
                      <div className="text-[9px] text-gray-400">+217 bps</div>
                    </div>
                  </div>
                </div>
              )}

              {step >= 4 && (
                <div className="animate-fadeIn p-2.5 rounded-lg bg-amber-50 border border-amber-200" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-amber-600 font-semibold">Sr Unsecured &apos;32</div>
                      <div className="text-[9px] text-gray-400">CCO Holdings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600">6.24%</div>
                      <div className="text-[9px] text-gray-400">+254 bps</div>
                    </div>
                  </div>
                </div>
              )}

              {/* HoldCo Bond */}
              {step >= 5 && (
                <div className="animate-fadeIn p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-red-500 font-semibold">Sr Unsecured &apos;31</div>
                      <div className="text-[9px] text-gray-400">Charter Comm Inc</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-500">6.89%</div>
                      <div className="text-[9px] text-gray-400">+319 bps</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="h-full min-h-[220px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-sm">Loading yields...</span>
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
    if (step >= 1 && step < 6) {
      const delays = [500, 500, 500, 600, 800];
      const timeout = setTimeout(() => setStep(prev => prev + 1), delays[step - 1] || 500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || step < 6) return;

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
      case 'maturity':
        return <MaturityWallDemo step={step} />;
      case 'yields':
        return <BondYieldsDemo step={step} />;
      default:
        return <StructureDemo step={step} />;
    }
  };

  return (
    <section id="demo" className="px-6 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            See It In Action
          </h2>
          <p className="text-gray-500 text-lg">
            Structured credit data, ready for your AI agent.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 border border-gray-200 overflow-x-auto">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleTabClick(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeDemo === demo.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Code Panel (stays dark) */}
          <div className="bg-[#0d1117] rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
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

          {/* Right: Results Panel (light theme) */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg min-h-[320px]">
            {/* Header */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                {activeDemo === 'structure' && 'Corporate Structure'}
                {activeDemo === 'maturity' && 'Maturity Schedule'}
                {activeDemo === 'yields' && 'Bond Yields'}
              </span>
              {step >= 1 && (
                <span className="animate-fadeIn text-xs font-mono text-gray-400">
                  {activeDemo === 'structure' && 'CHTR'}
                  {activeDemo === 'maturity' && 'CHTR'}
                  {activeDemo === 'yields' && 'CHTR · 4 bonds'}
                </span>
              )}
            </div>

            {renderDemo()}
          </div>
        </div>

        {/* Auto-rotate indicator */}
        {autoRotate && (
          <div className="mt-6 flex justify-center">
            <span className="text-xs text-gray-400">
              Auto-rotating demos · Click a tab to stop
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
