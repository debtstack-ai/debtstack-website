'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Company {
  ticker: string;
  name: string;
  sector?: string;
  leverage_ratio?: number;
}

interface Bond {
  name: string;
  cusip: string;
  company_ticker: string;
  seniority?: string;
  coupon_rate?: number;
  maturity_date?: string;
}

interface DataSearchProps {
  apiKey: string;
  onSelect: (message: string) => void;
}

export default function DataSearch({ apiKey, onSelect }: DataSearchProps) {
  const [activeTab, setActiveTab] = useState<'companies' | 'bonds'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Bonds state
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [bondsLoading, setBondsLoading] = useState(false);
  const [bondsError, setBondsError] = useState<string | null>(null);
  const [bondTickerQuery, setBondTickerQuery] = useState('');

  // Fetch all companies on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchCompanies() {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        // Fetch first page
        const res1 = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, type: 'companies', offset: 0 }),
        });
        if (!res1.ok) {
          const err = await res1.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load companies');
        }
        const page1 = await res1.json();
        const firstBatch: Company[] = page1.data?.data || page1.data || [];

        // Fetch second page if first returned 100
        let allCompanies = firstBatch;
        if (firstBatch.length >= 100) {
          const res2 = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, type: 'companies', offset: 100 }),
          });
          if (res2.ok) {
            const page2 = await res2.json();
            const secondBatch: Company[] = page2.data?.data || page2.data || [];
            allCompanies = [...firstBatch, ...secondBatch];
          }
        }

        if (!cancelled) {
          setCompanies(allCompanies);
        }
      } catch (err) {
        if (!cancelled) {
          setCompaniesError(err instanceof Error ? err.message : 'Failed to load companies');
        }
      } finally {
        if (!cancelled) {
          setCompaniesLoading(false);
        }
      }
    }

    fetchCompanies();
    return () => { cancelled = true; };
  }, [apiKey]);

  // Filter companies client-side
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.ticker.toLowerCase().startsWith(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  // Filtered companies for bond ticker autocomplete
  const bondTickerMatches = useMemo(() => {
    if (!bondTickerQuery.trim() || selectedTicker) return [];
    const q = bondTickerQuery.toLowerCase();
    return companies
      .filter(
        (c) =>
          c.ticker.toLowerCase().startsWith(q) ||
          c.name.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [companies, bondTickerQuery, selectedTicker]);

  // Fetch bonds for a ticker
  const fetchBonds = useCallback(
    async (ticker: string) => {
      setSelectedTicker(ticker);
      setBondTickerQuery(ticker);
      setBondsLoading(true);
      setBondsError(null);
      setBonds([]);

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, type: 'bonds', ticker }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load bonds');
        }
        const result = await res.json();
        setBonds(result.data?.data || result.data || []);
      } catch (err) {
        setBondsError(err instanceof Error ? err.message : 'Failed to load bonds');
      } finally {
        setBondsLoading(false);
      }
    },
    [apiKey]
  );

  const handleBackToBondSearch = () => {
    setSelectedTicker(null);
    setBondTickerQuery('');
    setBonds([]);
    setBondsError(null);
  };

  return (
    <div className="p-3 border-t border-gray-100">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
        Search Data
      </h3>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-2 px-1">
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
            activeTab === 'companies'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Companies
        </button>
        <button
          onClick={() => setActiveTab('bonds')}
          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
            activeTab === 'bonds'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Bonds
        </button>
      </div>

      {/* Companies tab */}
      {activeTab === 'companies' && (
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${companies.length || '...'} companies...`}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2] mb-2"
          />

          {companiesLoading && (
            <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading companies...
            </div>
          )}

          {companiesError && (
            <p className="px-3 py-2 text-xs text-red-500">{companiesError}</p>
          )}

          {!companiesLoading && !companiesError && (
            <div className="max-h-[300px] overflow-y-auto space-y-0.5">
              {filteredCompanies.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400">No results</p>
              ) : (
                filteredCompanies.map((company) => (
                  <button
                    key={company.ticker}
                    onClick={() =>
                      onSelect(
                        `Tell me about ${company.ticker}'s debt structure and leverage`
                      )
                    }
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-[#2383e2] transition"
                  >
                    <span className="font-mono text-xs font-semibold text-gray-900 w-12 flex-shrink-0">
                      {company.ticker}
                    </span>
                    <span className="flex-1 text-xs text-gray-600 truncate">
                      {company.name}
                    </span>
                    {company.leverage_ratio != null && (
                      <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                        {company.leverage_ratio.toFixed(1)}x
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Bonds tab */}
      {activeTab === 'bonds' && (
        <div>
          {!selectedTicker ? (
            <div>
              <input
                type="text"
                value={bondTickerQuery}
                onChange={(e) => {
                  setBondTickerQuery(e.target.value.toUpperCase());
                  setSelectedTicker(null);
                }}
                placeholder="Enter ticker (e.g. RIG)..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2] mb-2 font-mono"
              />
              {bondTickerMatches.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                  {bondTickerMatches.map((company) => (
                    <button
                      key={company.ticker}
                      onClick={() => fetchBonds(company.ticker)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-[#2383e2] transition"
                    >
                      <span className="font-mono text-xs font-semibold text-gray-900 w-12 flex-shrink-0">
                        {company.ticker}
                      </span>
                      <span className="flex-1 text-xs text-gray-600 truncate">
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {bondTickerQuery.trim() && bondTickerMatches.length === 0 && companies.length > 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">
                  No matching companies. Try a different ticker.
                </p>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={handleBackToBondSearch}
                className="flex items-center gap-1 px-2 py-1 mb-2 text-xs text-gray-500 hover:text-gray-700 transition"
              >
                <span>&larr;</span>
                <span>Back</span>
              </button>
              <div className="px-2 mb-2">
                <span className="font-mono text-xs font-semibold text-gray-900">
                  {selectedTicker}
                </span>
                <span className="text-xs text-gray-400 ml-1">bonds</span>
              </div>

              {bondsLoading && (
                <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-400">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading bonds...
                </div>
              )}

              {bondsError && (
                <p className="px-3 py-2 text-xs text-red-500">{bondsError}</p>
              )}

              {!bondsLoading && !bondsError && (
                <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                  {bonds.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-gray-400">No bonds found</p>
                  ) : (
                    bonds.map((bond) => (
                      <button
                        key={bond.cusip}
                        onClick={() =>
                          onSelect(
                            `Show me details for ${bond.name} (CUSIP: ${bond.cusip})`
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-lg text-left hover:bg-blue-50 hover:text-[#2383e2] transition"
                      >
                        <div className="text-xs text-gray-700 truncate">
                          {bond.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-gray-400">
                            {bond.cusip}
                          </span>
                          {bond.seniority && (
                            <span className="text-[10px] text-gray-400">
                              {bond.seniority}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
