'use client';

import { useState, useEffect, useCallback } from 'react';

interface MarketItem {
  label: string;
  type: 'yield' | 'etf' | 'index' | 'commodity';
  value: number | null;
  change: number | null;
  percentChange: number | null;
  previousClose: number | null;
  timestamp: string | null;
}

const TICKER_LABELS = [
  '3M', '5Y', '10Y', '30Y', 'VIX', 'MOVE',
  'HYG', 'LQD', 'AGG', 'TLT', 'EMB',
  'SPX', 'DXY', 'WTI', 'GOLD',
];

// Safely convert any value to a number, returning null if not possible
function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}

function formatValue(value: number, type: string): string {
  const v = typeof value === 'number' && isFinite(value) ? value : 0;
  switch (type) {
    case 'yield':
      return `${v.toFixed(2)}%`;
    case 'etf':
    case 'commodity':
      return `$${v.toFixed(2)}`;
    default:
      return v.toFixed(2);
  }
}

// Sanitize raw API items — coerce all numeric fields through Number()
function sanitizeItems(raw: unknown[]): MarketItem[] {
  return raw.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    return {
      label: String(obj.label ?? ''),
      type: (obj.type ?? 'index') as MarketItem['type'],
      value: toNum(obj.value),
      change: toNum(obj.change),
      percentChange: toNum(obj.percentChange),
      previousClose: toNum(obj.previousClose),
      timestamp: obj.timestamp ? String(obj.timestamp) : null,
    };
  });
}

export default function TreasuryTicker() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async (isInitial: boolean) => {
    try {
      const res = await fetch('/api/treasury');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setItems(sanitizeItems(Array.isArray(data.items) ? data.items : []));
      setError(false);
    } catch {
      if (isInitial) setError(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-gray-900 overflow-hidden h-[32px] flex items-center px-4">
        <div className="flex items-center gap-4">
          {TICKER_LABELS.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-gray-500 text-xs font-mono">{label}</span>
              <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-gray-900 overflow-hidden h-[32px] flex items-center px-4">
        <span className="text-gray-500 text-xs font-mono">Rates unavailable</span>
      </div>
    );
  }

  const tickerContent = items.map((item, i) => (
    <span key={item.label} className="flex items-center gap-1.5 shrink-0">
      <span className="text-gray-400 text-xs font-mono">{item.label}</span>
      {item.value !== null ? (
        <>
          <span className="text-white text-xs font-mono font-medium">
            {formatValue(item.value, item.type)}
          </span>
          {item.change !== null && (
            <span
              className={`text-xs font-mono ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {item.change >= 0 ? '\u25B2' : '\u25BC'}
              {(typeof item.change === 'number' ? Math.abs(item.change) : 0).toFixed(2)}
            </span>
          )}
        </>
      ) : (
        <span className="text-gray-500 text-xs font-mono">--</span>
      )}
      {i < items.length - 1 && (
        <span className="text-gray-600 text-xs mx-2">·</span>
      )}
    </span>
  ));

  return (
    <div className="bg-gray-900 overflow-hidden h-[32px] flex items-center group">
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          animation: 'ticker-scroll 60s linear infinite',
          animationPlayState: 'running',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
        onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
      >
        {/* First copy */}
        <div className="flex items-center gap-1.5 px-4 shrink-0">
          {tickerContent}
        </div>
        {/* Second copy for seamless loop */}
        <div className="flex items-center gap-1.5 px-4 shrink-0">
          {tickerContent}
        </div>
      </div>
    </div>
  );
}
