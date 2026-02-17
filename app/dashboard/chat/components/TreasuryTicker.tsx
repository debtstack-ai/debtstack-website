'use client';

import { useState, useEffect, useCallback } from 'react';

interface YieldData {
  maturity: string;
  yield: number | null;
  change: number | null;
  percentChange: number | null;
  previousClose: number | null;
  timestamp: string | null;
}

export default function TreasuryTicker() {
  const [yields, setYields] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchYields = useCallback(async (isInitial: boolean) => {
    if (!isInitial) setRefreshing(true);
    try {
      const res = await fetch('/api/treasury');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setYields(data.yields);
      setError(false);

      // Use the first available timestamp
      const ts = data.yields.find((y: YieldData) => y.timestamp)?.timestamp;
      if (ts) setLastUpdated(ts);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchYields(true);
    const interval = setInterval(() => fetchYields(false), 60_000);
    return () => clearInterval(interval);
  }, [fetchYields]);

  if (loading) {
    return (
      <div className="bg-gray-900 px-4 py-1.5 flex items-center gap-6 min-h-[32px]">
        {['5Y', '10Y', '30Y'].map((m) => (
          <div key={m} className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-mono">{m}</span>
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error && yields.length === 0) {
    return (
      <div className="bg-gray-900 px-4 py-1.5 flex items-center min-h-[32px]">
        <span className="text-gray-500 text-xs font-mono">Rates unavailable</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 px-4 py-1.5 flex items-center gap-6 min-h-[32px]">
      {yields.map((y) => (
        <div key={y.maturity} className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs font-mono">{y.maturity}</span>
          {y.yield !== null ? (
            <>
              <span className="text-white text-xs font-mono font-medium transition-colors duration-700">
                {y.yield.toFixed(2)}%
              </span>
              {y.change !== null && (
                <span
                  className={`text-xs font-mono transition-colors duration-700 ${
                    y.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {y.change >= 0 ? '\u25B2' : '\u25BC'}
                  {Math.abs(y.change).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-xs font-mono">--</span>
          )}
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {lastUpdated && (
          <span className="text-gray-600 text-[10px] font-mono">
            as of {lastUpdated}
          </span>
        )}
        {refreshing && (
          <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse" />
        )}
      </div>
    </div>
  );
}
