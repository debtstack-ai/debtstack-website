// components/LiveDemo.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// === Data Types ===

interface EntityColors {
  bg: string;
  border: string;
  badge: string;
  text: string;
}

interface BondColors {
  bg: string;
  border: string;
  text: string;
  structureLabel: string;
}

interface StructureEntity {
  name: string;
  jurisdiction: string;
  label: string;
  totalDebt: string;
  instruments: { label: string; amount: string }[];
  colors: EntityColors;
}

interface MaturityItem {
  year: string;
  amount: number;
  secured: number;
  unsecured: number;
}

interface BondYield {
  label: string;
  issuerName: string;
  ytm: string;
  spread: string;
  colors: BondColors;
}

interface MiniStructureItem {
  label: string;
  name: string;
  yieldRange: string;
  colors: EntityColors;
}

export interface DemoData {
  structure: {
    companyName: string;
    ticker: string;
    entityCount: number;
    instrumentCount: number;
    totalDebt: string;
    entities: StructureEntity[];
  };
  maturityWall: {
    companyName: string;
    ticker: string;
    instrumentCount: number;
    totalDebt: string;
    maturities: MaturityItem[];
  };
  yields: {
    ticker: string;
    bondCount: number;
    bonds: BondYield[];
    miniStructure: MiniStructureItem[];
  };
}

// === Fallback Data (CHTR) ===

const FALLBACK_DEMO_DATA: DemoData = {
  structure: {
    companyName: 'Charter Communications',
    ticker: 'CHTR',
    entityCount: 131,
    instrumentCount: 16,
    totalDebt: '$94B',
    entities: [
      {
        name: 'Charter Communications, Inc.',
        jurisdiction: 'Delaware · Public (NASDAQ)',
        label: 'HoldCo',
        totalDebt: '$57.0B',
        instruments: [{ label: 'Sr Secured Notes', amount: '$57.0B' }],
        colors: { bg: 'blue-50', border: 'blue-200', badge: 'blue-600', text: 'blue-600' },
      },
      {
        name: 'CCO Holdings, LLC',
        jurisdiction: 'Intermediate HoldCo',
        label: 'Intermediate',
        totalDebt: '$27.3B',
        instruments: [{ label: 'Sr Unsecured Notes', amount: '$27.3B' }],
        colors: { bg: 'amber-50', border: 'amber-200', badge: 'amber-600', text: 'amber-600' },
      },
      {
        name: 'Charter Operating, LLC',
        jurisdiction: 'Operating Company',
        label: 'OpCo',
        totalDebt: '$15.3B',
        instruments: [
          { label: 'Term Loans A/B', amount: '$10.3B' },
          { label: 'Secured Notes', amount: '$5.0B' },
        ],
        colors: { bg: 'emerald-50', border: 'emerald-200', badge: 'emerald-600', text: 'emerald-600' },
      },
    ],
  },
  maturityWall: {
    companyName: 'Charter Communications',
    ticker: 'CHTR',
    instrumentCount: 16,
    totalDebt: '$94B',
    maturities: [
      { year: '2028', amount: 1.5, secured: 1.5, unsecured: 0 },
      { year: '2029', amount: 1.5, secured: 1.5, unsecured: 0 },
      { year: '2030', amount: 7.4, secured: 7.4, unsecured: 0 },
      { year: '2031', amount: 3.3, secured: 2.5, unsecured: 0.8 },
      { year: '2034+', amount: 4.3, secured: 3.5, unsecured: 0.8 },
    ],
  },
  yields: {
    ticker: 'CHTR',
    bondCount: 4,
    bonds: [
      {
        label: "Sr Secured '29",
        issuerName: 'Charter Operating',
        ytm: '4.64%',
        spread: '+35 bps',
        colors: { bg: 'emerald-50', border: 'emerald-200', text: 'emerald-600', structureLabel: 'OpCo' },
      },
      {
        label: "Sr Secured '55",
        issuerName: 'Charter Operating',
        ytm: '6.86%',
        spread: '+207 bps',
        colors: { bg: 'emerald-50', border: 'emerald-200', text: 'emerald-600', structureLabel: 'OpCo' },
      },
      {
        label: "Sr Unsecured '49",
        issuerName: 'Charter Comm Inc',
        ytm: '6.90%',
        spread: '+204 bps',
        colors: { bg: 'red-50', border: 'red-200', text: 'red-500', structureLabel: 'HoldCo' },
      },
      {
        label: "Sr Unsecured '63",
        issuerName: 'Charter Comm Inc',
        ytm: '7.06%',
        spread: '+227 bps',
        colors: { bg: 'red-50', border: 'red-200', text: 'red-500', structureLabel: 'HoldCo' },
      },
    ],
    miniStructure: [
      {
        label: 'HoldCo',
        name: 'Charter Comm',
        yieldRange: '6.90-7.06%',
        colors: { bg: 'blue-50', border: 'blue-200', badge: 'blue-600', text: 'blue-600' },
      },
      {
        label: 'Intermediate',
        name: 'CCO Holdings',
        yieldRange: '',
        colors: { bg: 'amber-50', border: 'amber-200', badge: 'amber-600', text: 'amber-600' },
      },
      {
        label: 'OpCo',
        name: 'Charter Operating',
        yieldRange: '4.64-6.86%',
        colors: { bg: 'emerald-50', border: 'emerald-200', badge: 'emerald-600', text: 'emerald-600' },
      },
    ],
  },
};

// === Demo Definitions ===

type DemoId = 'structure' | 'maturity' | 'yields';

interface Demo {
  id: DemoId;
  title: string;
  codeLines: { tokens: { text: string; type: string }[] }[];
}

function buildDemos(ticker: string): Demo[] {
  return [
    {
      id: 'structure',
      title: 'Corporate Structure',
      codeLines: [
        { tokens: [{ text: 'from', type: 'keyword' }, { text: ' debtstack ', type: 'default' }, { text: 'import', type: 'keyword' }, { text: ' DebtStackClient', type: 'class' }] },
        { tokens: [{ text: '', type: 'default' }] },
        { tokens: [{ text: 'client', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'DebtStackClient', type: 'class' }, { text: '(', type: 'default' }, { text: 'api_key', type: 'param' }, { text: '=', type: 'default' }, { text: '"sk_live_..."', type: 'string' }, { text: ')', type: 'default' }] },
        { tokens: [{ text: '', type: 'default' }] },
        { tokens: [{ text: '# Get corporate debt structure', type: 'comment' }] },
        { tokens: [{ text: 'structure', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_structure', type: 'method' }, { text: '(', type: 'default' }, { text: `"${ticker}"`, type: 'string' }, { text: ')', type: 'default' }] },
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
        { tokens: [{ text: 'maturities', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_maturity_wall', type: 'method' }, { text: '(', type: 'default' }, { text: `"${ticker}"`, type: 'string' }, { text: ')', type: 'default' }] },
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
        { tokens: [{ text: 'yields', type: 'variable' }, { text: ' = ', type: 'default' }, { text: 'client', type: 'variable' }, { text: '.', type: 'default' }, { text: 'get_bond_yields', type: 'method' }, { text: '(', type: 'default' }, { text: `"${ticker}"`, type: 'string' }, { text: ')', type: 'default' }] },
      ],
    },
  ];
}

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

// === Tailwind color class maps ===
// Tailwind can't detect dynamically constructed class names, so we map data values to full classes.
const bgColorMap: Record<string, string> = {
  'blue-50': 'bg-blue-50',
  'amber-50': 'bg-amber-50',
  'emerald-50': 'bg-emerald-50',
  'red-50': 'bg-red-50',
  'purple-50': 'bg-purple-50',
  'gray-50': 'bg-gray-50',
};

const borderColorMap: Record<string, string> = {
  'blue-200': 'border-blue-200',
  'amber-200': 'border-amber-200',
  'emerald-200': 'border-emerald-200',
  'red-200': 'border-red-200',
  'purple-200': 'border-purple-200',
  'gray-200': 'border-gray-200',
};

const badgeBgMap: Record<string, string> = {
  'blue-600': 'bg-blue-600',
  'amber-600': 'bg-amber-600',
  'emerald-600': 'bg-emerald-600',
  'purple-600': 'bg-purple-600',
  'red-600': 'bg-red-600',
  'red-500': 'bg-red-500',
};

const textColorMap: Record<string, string> = {
  'blue-600': 'text-blue-600',
  'amber-600': 'text-amber-600',
  'emerald-600': 'text-emerald-600',
  'purple-600': 'text-purple-600',
  'red-500': 'text-red-500',
  'red-600': 'text-red-600',
};

const textOpacityMap: Record<string, string> = {
  'blue-600': 'text-blue-600/70',
  'amber-600': 'text-amber-600/70',
  'emerald-600': 'text-emerald-600/70',
  'purple-600': 'text-purple-600/70',
  'red-500': 'text-red-500/70',
  'red-600': 'text-red-600/70',
};

const borderOpacityMap: Record<string, string> = {
  'blue-200': 'border-blue-200/50',
  'amber-200': 'border-amber-200/50',
  'emerald-200': 'border-emerald-200/50',
  'purple-200': 'border-purple-200/50',
  'red-200': 'border-red-200/50',
};

// === Structure Demo Component ===

function StructureDemo({ step, data }: { step: number; data: DemoData['structure'] }) {
  const entities = data.entities;

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
                <div className="text-gray-900 font-semibold">{data.companyName}</div>
                <div className="text-xs text-gray-400">{data.entityCount} entities · {data.instrumentCount} instruments</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{data.totalDebt}</div>
              <div className="text-xs text-gray-400">Total Debt</div>
            </div>
          </div>

          {/* Org Chart */}
          <div className="relative">
            {entities.map((entity, index) => {
              const entityStep = index + 2; // entities start appearing at step 2
              const instrumentStep = index + 3; // instruments appear one step after entity
              const showEntity = step >= entityStep;
              const showInstruments = step >= instrumentStep && entity.instruments.length > 0;
              const showConnector = index > 0 && step >= entityStep;
              const isFirst = index === 0;

              return (
                <div key={entity.name}>
                  {/* Connector Line */}
                  {showConnector && (
                    <div className="animate-fadeIn flex justify-center my-2">
                      <svg width="200" height="20" className="text-gray-300">
                        <path d="M100 0 L100 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        {index === 1 && <circle cx="100" cy="4" r="2" fill="currentColor" />}
                      </svg>
                    </div>
                  )}

                  {/* Entity Card */}
                  {showEntity && (
                    <div className="animate-fadeIn mb-3">
                      <div className={`relative ${isFirst ? 'p-4' : 'p-3'} rounded-xl ${bgColorMap[entity.colors.bg] || 'bg-gray-50'} border ${borderColorMap[entity.colors.border] || 'border-gray-200'}`}>
                        <div className="absolute -top-2 left-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeBgMap[entity.colors.badge] || 'bg-gray-600'} text-white rounded`}>{entity.label}</span>
                        </div>
                        <div className={`flex justify-between ${isFirst ? 'items-center mt-1' : 'items-start mb-2'}`}>
                          <div>
                            <div className={`${isFirst ? 'font-semibold' : 'font-medium text-sm'} text-gray-900`}>{entity.name}</div>
                            <div className={`${isFirst ? 'text-xs mt-0.5' : 'text-[10px]'} ${textOpacityMap[entity.colors.text] || 'text-gray-400'}`}>{entity.jurisdiction}</div>
                          </div>
                          <div className="text-right">
                            {isFirst && <div className="text-xs text-gray-400">Direct Debt</div>}
                            <div className={`${isFirst ? 'text-sm' : 'text-sm'} font-semibold ${textColorMap[entity.colors.text] || 'text-gray-600'}`}>{entity.totalDebt}</div>
                          </div>
                        </div>

                        {/* Instruments (shown for non-first entities, or when explicitly triggered) */}
                        {!isFirst && showInstruments && (
                          <div className={`animate-fadeIn space-y-1.5 pt-2 border-t ${borderOpacityMap[entity.colors.border] || 'border-gray-200/50'}`}>
                            {entity.instruments.map((inst) => (
                              <div key={inst.label} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{inst.label}</span>
                                <span className="text-gray-700 font-medium">{inst.amount}</span>
                              </div>
                            ))}
                            {entity.label === 'Intermediate' && (
                              <div className={`text-[10px] ${textOpacityMap[entity.colors.text] || 'text-gray-400'}`}>Guarantor for OpCo debt</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

// === Maturity Wall Demo Component ===

function MaturityWallDemo({ step, data }: { step: number; data: DemoData['maturityWall'] }) {
  const maturities = data.maturities;
  const maxAmount = Math.max(...maturities.map(m => m.amount));

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
                <div className="text-gray-900 font-semibold">{data.companyName}</div>
                <div className="text-xs text-gray-400">{data.ticker} · {data.instrumentCount} instruments</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{data.totalDebt}</div>
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

// === Bond Yields Demo Component ===

function BondYieldsDemo({ step, data }: { step: number; data: DemoData['yields'] }) {
  const { bonds, miniStructure } = data;

  return (
    <div className="p-4">
      {step >= 1 ? (
        <div className="relative flex gap-4">
          {/* Left: Mini Corporate Structure */}
          <div className="w-[140px] flex-shrink-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 text-center">Structure</div>

            {miniStructure.map((entity, index) => {
              const entityStep = index + 1;
              const showEntity = step >= entityStep;
              const showConnector = index > 0 && step >= entityStep;

              return (
                <div key={entity.label}>
                  {/* Connector */}
                  {showConnector && (
                    <div className="animate-fadeIn flex justify-center">
                      <svg width="2" height="12" className="text-gray-300">
                        <path d="M1 0 L1 12" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}

                  {showEntity && (
                    <div className="animate-fadeIn">
                      <div className={`p-2 rounded-lg ${bgColorMap[entity.colors.bg] || 'bg-gray-50'} border ${borderColorMap[entity.colors.border] || 'border-gray-200'} text-center`}>
                        <div className={`text-[9px] ${textColorMap[entity.colors.text] || 'text-gray-600'} font-semibold uppercase`}>{entity.label}</div>
                        <div className="text-[10px] text-gray-900 font-medium mt-0.5">{entity.name}</div>
                        <div className={`text-[10px] ${textColorMap[entity.colors.text] || 'text-gray-600'} font-semibold`}>{entity.yieldRange}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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
              {bonds.map((bond, index) => {
                // Map bonds to steps: first bond at step 3, then step 4 for middle bonds, step 5 for last
                let bondStep: number;
                if (index === 0) bondStep = 3;
                else if (index === bonds.length - 1) bondStep = 5;
                else bondStep = 4;

                const showBond = step >= bondStep;

                return showBond ? (
                  <div
                    key={bond.label}
                    className={`animate-fadeIn p-2.5 rounded-lg ${bgColorMap[bond.colors.bg] || 'bg-gray-50'} border ${borderColorMap[bond.colors.border] || 'border-gray-200'}`}
                    style={{ animationDelay: index > 0 && bondStep === 4 ? `${(index - 1) * 100}ms` : undefined }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-[10px] ${textColorMap[bond.colors.text] || 'text-gray-600'} font-semibold`}>{bond.label}</div>
                        <div className="text-[9px] text-gray-400">{bond.issuerName}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${textColorMap[bond.colors.text] || 'text-gray-600'}`}>{bond.ytm}</div>
                        <div className="text-[9px] text-gray-400">{bond.spread}</div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
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

// === Main LiveDemo Component ===

export default function LiveDemo({ data }: { data?: DemoData }) {
  const demoData = data ?? FALLBACK_DEMO_DATA;
  const ticker = demoData.structure.ticker;
  const demos = buildDemos(ticker);

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
  }, [autoRotate, step, activeDemo, resetAnimation, demos]);

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
        return <StructureDemo step={step} data={demoData.structure} />;
      case 'maturity':
        return <MaturityWallDemo step={step} data={demoData.maturityWall} />;
      case 'yields':
        return <BondYieldsDemo step={step} data={demoData.yields} />;
      default:
        return <StructureDemo step={step} data={demoData.structure} />;
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
                  {activeDemo === 'structure' && ticker}
                  {activeDemo === 'maturity' && ticker}
                  {activeDemo === 'yields' && `${ticker} · ${demoData.yields.bondCount} bonds`}
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
