// app/explorer/page.tsx
'use client';

import { useState } from 'react';
import { SignUpButton, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://credible-ai-production.up.railway.app';

interface DebtInstrument {
  id: string;
  name: string;
  type: string;
  issuer: string;
  seniority: string;
  outstanding: number;
  interest_rate: number | null;
  maturity_date: string | null;
  guarantors: string[];
  guarantor_count: number;
}

interface EntityNode {
  id: string;
  name: string;
  type: string;
  tier: number;
  jurisdiction?: string;
  is_borrower?: boolean;
  is_guarantor?: boolean;
  ownership_pct?: number;
  children: EntityNode[];
  debt_at_entity?: {
    total: number;
    instruments: DebtInstrument[];
  };
}

interface CompanyData {
  ticker: string;
  name: string;
  sector: string;
  total_debt: number;
  entity_count: number;
  instrument_count: number;
  structure: EntityNode | null;
}

// Format currency
const formatCurrency = (cents: number): string => {
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) {
    return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  } else if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(0)}M`;
  }
  return `$${dollars.toLocaleString()}`;
};

// Entity type colors
const entityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  holdco: { bg: 'from-blue-950/80 to-blue-900/40', border: 'border-blue-500/40', text: 'text-blue-400', badge: 'bg-blue-500' },
  intermediate: { bg: 'from-amber-950/80 to-amber-900/30', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-500' },
  opco: { bg: 'from-emerald-950/80 to-emerald-900/30', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500' },
  subsidiary: { bg: 'from-purple-950/80 to-purple-900/30', border: 'border-purple-500/40', text: 'text-purple-400', badge: 'bg-purple-500' },
  finco: { bg: 'from-cyan-950/80 to-cyan-900/30', border: 'border-cyan-500/40', text: 'text-cyan-400', badge: 'bg-cyan-500' },
  spv: { bg: 'from-pink-950/80 to-pink-900/30', border: 'border-pink-500/40', text: 'text-pink-400', badge: 'bg-pink-500' },
  default: { bg: 'from-gray-900/80 to-gray-800/30', border: 'border-gray-600/40', text: 'text-gray-400', badge: 'bg-gray-500' },
};

const getEntityStyle = (entityType: string) => {
  const type = entityType?.toLowerCase() || 'default';
  return entityColors[type] || entityColors.default;
};

const getEntityLabel = (entityType: string): string => {
  const type = entityType?.toLowerCase() || '';
  if (type === 'holdco') return 'HoldCo';
  if (type === 'opco') return 'OpCo';
  if (type === 'intermediate') return 'Intermediate';
  if (type === 'subsidiary') return 'Subsidiary';
  if (type === 'finco') return 'FinCo';
  if (type === 'spv') return 'SPV';
  return entityType || 'Entity';
};

// Entity card component
function EntityCard({ entity, isChild = false }: { entity: EntityNode; isChild?: boolean }) {
  const style = getEntityStyle(entity.type);
  const debtTotal = entity.debt_at_entity?.total || 0;
  const instruments = entity.debt_at_entity?.instruments || [];

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${style.bg} ${style.border} border shadow-lg relative`}>
      {/* Entity type badge */}
      <div className="absolute -top-2.5 left-4">
        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.badge} text-white rounded`}>
          {getEntityLabel(entity.type)}
        </span>
      </div>

      <div className="flex items-start justify-between mt-1">
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-semibold text-white text-sm">{entity.name}</div>
          {entity.jurisdiction && (
            <div className="text-xs text-gray-500 mt-0.5">{entity.jurisdiction}</div>
          )}
        </div>
        {debtTotal > 0 && (
          <div className="text-right flex-shrink-0">
            <div className={`text-sm font-bold ${style.text}`}>{formatCurrency(debtTotal)}</div>
          </div>
        )}
      </div>

      {/* Debt instruments */}
      {instruments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
          {instruments.slice(0, 3).map((d, i) => (
            <div key={d.id || i} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 truncate max-w-[60%]">{d.name}</span>
              <span className="text-gray-300 font-medium">{formatCurrency(d.outstanding)}</span>
            </div>
          ))}
          {instruments.length > 3 && (
            <div className="text-xs text-gray-500">+{instruments.length - 3} more</div>
          )}
        </div>
      )}

      {/* Badges */}
      {(entity.is_guarantor || entity.is_borrower) && (
        <div className="flex gap-2 mt-2">
          {entity.is_guarantor && (
            <span className="px-1.5 py-0.5 text-[9px] rounded bg-green-900/50 text-green-400 border border-green-700/50">
              Guarantor
            </span>
          )}
          {entity.is_borrower && (
            <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-900/50 text-blue-400 border border-blue-700/50">
              Borrower
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Recursive tree component
function EntityTree({ entity }: { entity: EntityNode }) {
  const hasChildren = entity.children && entity.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* This entity */}
      <div className="w-[280px]">
        <EntityCard entity={entity} />
      </div>

      {/* Children */}
      {hasChildren && (
        <>
          {/* Vertical connector down */}
          <div className="w-px h-6 bg-gray-700" />

          {/* Horizontal connector if multiple children */}
          {entity.children!.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-px bg-gray-700"
                style={{
                  width: `${Math.min(entity.children!.length * 300, 900)}px`,
                  maxWidth: '100%'
                }}
              />
            </div>
          )}

          {/* Children row */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {entity.children!.map((child, i) => (
              <div key={child.id || i} className="relative">
                {/* Vertical connector up to horizontal line */}
                <div className="absolute -top-6 left-1/2 w-px h-6 bg-gray-700" />
                <EntityTree entity={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Sample tickers
const sampleTickers = ['CHTR', 'T', 'VZ', 'CMCSA', 'DIS', 'NFLX', 'AAPL', 'MSFT'];

export default function ExplorerPage() {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async (tickerToFetch: string) => {
    const t = tickerToFetch.toUpperCase().trim();
    if (!t) return;

    setLoading(true);
    setError(null);
    setData(null);
    setTicker(t);

    try {
      // Fetch company overview and structure
      const [overviewRes, structureRes] = await Promise.all([
        fetch(`${API_BASE}/v1/companies/${t}`),
        fetch(`${API_BASE}/v1/companies/${t}/structure`),
      ]);

      if (!overviewRes.ok) {
        if (overviewRes.status === 404) {
          throw new Error(`Company "${t}" not found. Try one of: ${sampleTickers.join(', ')}`);
        }
        throw new Error('Failed to fetch company data');
      }

      const overview = await overviewRes.json();
      const structureData = structureRes.ok ? await structureRes.json() : null;

      setData({
        ticker: t,
        name: overview.data?.name || t,
        sector: overview.data?.sector || '',
        total_debt: overview.data?.total_debt || 0,
        entity_count: overview.data?.entity_count || 0,
        instrument_count: overview.data?.debt_instrument_count || 0,
        structure: structureData?.data?.structure || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompany(ticker);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative px-6 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-16 md:h-24 w-auto" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/#demo" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Demo
            </a>
            <a href="/explorer" className="text-white transition text-sm font-medium">
              Explorer
            </a>
            <a href="/pricing" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Pricing
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-400 hover:text-white transition text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard" className="text-gray-400 hover:text-white transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Search Section */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Corporate Structure Explorer
          </h1>
          <p className="text-gray-400 mb-8">
            Visualize corporate debt structures for 189 S&P/NASDAQ 100 companies.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker (e.g., CHTR)"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !ticker.trim()}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Explore'}
            </button>
          </form>

          {/* Quick picks */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-gray-500">Try:</span>
            {sampleTickers.map(t => (
              <button
                key={t}
                onClick={() => fetchCompany(t)}
                className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="px-6 pb-12">
          <div className="max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-center">
              {error}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-500 mt-4">Fetching corporate structure...</p>
          </div>
        </section>
      )}

      {/* Results */}
      {data && !loading && (
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Company Header */}
            <div className="mb-8 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-800 text-gray-400">{data.ticker}</span>
                    {data.sector && (
                      <span className="text-sm text-gray-500">{data.sector}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">{data.name}</h2>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatCurrency(data.total_debt)}</div>
                    <div className="text-xs text-gray-500">Total Debt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.entity_count}</div>
                    <div className="text-xs text-gray-500">Entities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.instrument_count}</div>
                    <div className="text-xs text-gray-500">Instruments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Visualization */}
            {data.structure ? (
              <div className="overflow-x-auto pb-8">
                <div className="min-w-[800px] flex justify-center py-6">
                  <EntityTree entity={data.structure} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No entity structure data available for this company.</p>
              </div>
            )}

            {/* CTA for non-signed in users */}
            <SignedOut>
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 text-center">
                <h3 className="text-xl font-semibold mb-2">Want to access this data programmatically?</h3>
                <p className="text-gray-400 mb-4">
                  Sign up for free to get API access to corporate structures, debt data, and more.
                </p>
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition">
                    Get Free API Access
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-16 w-auto" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a href="/#demo" className="hover:text-white transition">Demo</a>
              <a href="/explorer" className="hover:text-white transition">Explorer</a>
              <a href="/pricing" className="hover:text-white transition">Pricing</a>
              <a href="https://docs.debtstack.ai" className="hover:text-white transition">Docs</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-600">
            © 2026 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
