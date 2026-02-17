// app/api/treasury/route.ts
// Server-side proxy to Yahoo Finance for credit market data
// No API key required — uses free Yahoo Finance chart endpoint

import { NextResponse } from 'next/server';

// Credit market symbols (15 total)
// Yields · Volatility · Credit · Bonds · Equities · FX · Commodities
const MARKET_SYMBOLS = [
  // Treasury yields
  { symbol: '^IRX',       label: '3M',   type: 'yield' },
  { symbol: '^FVX',       label: '5Y',   type: 'yield' },
  { symbol: '^TNX',       label: '10Y',  type: 'yield' },
  { symbol: '^TYX',       label: '30Y',  type: 'yield' },
  // Volatility & risk
  { symbol: '^VIX',       label: 'VIX',  type: 'index' },
  { symbol: '^MOVE',      label: 'MOVE', type: 'index' },
  // Credit ETFs
  { symbol: 'HYG',        label: 'HYG',  type: 'etf' },
  { symbol: 'LQD',        label: 'LQD',  type: 'etf' },
  // Broad bonds & duration
  { symbol: 'AGG',        label: 'AGG',  type: 'etf' },
  { symbol: 'TLT',        label: 'TLT',  type: 'etf' },
  // EM debt
  { symbol: 'EMB',        label: 'EMB',  type: 'etf' },
  // Equity index
  { symbol: '^GSPC',      label: 'SPX',  type: 'index' },
  // FX & dollar
  { symbol: 'DX-Y.NYB',   label: 'DXY',  type: 'index' },
  // Commodities
  { symbol: 'CL=F',       label: 'WTI',  type: 'commodity' },
  { symbol: 'GC=F',       label: 'GOLD', type: 'commodity' },
];

interface YahooChartResult {
  meta: {
    symbol: string;
    regularMarketPrice: number;
    chartPreviousClose: number;
    regularMarketTime: number;
  };
}

export async function GET() {
  try {
    const results = await Promise.all(
      MARKET_SYMBOLS.map(async ({ symbol, label, type }) => {
        try {
          const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
          });

          if (!res.ok) return { label, type, value: null, change: null, percentChange: null, previousClose: null, timestamp: null };

          const data = await res.json();
          const result: YahooChartResult = data.chart?.result?.[0];
          if (!result?.meta) return { label, type, value: null, change: null, percentChange: null, previousClose: null, timestamp: null };

          const { regularMarketPrice, chartPreviousClose, regularMarketTime } = result.meta;
          const change = regularMarketPrice - chartPreviousClose;
          const percentChange = chartPreviousClose !== 0 ? (change / chartPreviousClose) * 100 : 0;

          return {
            label,
            type,
            value: regularMarketPrice,
            change: parseFloat(change.toFixed(3)),
            percentChange: parseFloat(percentChange.toFixed(2)),
            previousClose: chartPreviousClose,
            timestamp: new Date(regularMarketTime * 1000).toISOString(),
          };
        } catch {
          return { label, type, value: null, change: null, percentChange: null, previousClose: null, timestamp: null };
        }
      })
    );

    return NextResponse.json(
      { items: results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Treasury API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
