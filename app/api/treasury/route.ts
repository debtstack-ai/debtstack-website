// app/api/treasury/route.ts
// Server-side proxy to Yahoo Finance for treasury yield data
// No API key required — uses free Yahoo Finance chart endpoint

import { NextResponse } from 'next/server';

// Yahoo Finance CBOE yield index symbols
const YIELD_SYMBOLS = [
  { symbol: '^FVX', maturity: '5Y' },
  { symbol: '^TNX', maturity: '10Y' },
  { symbol: '^TYX', maturity: '30Y' },
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
      YIELD_SYMBOLS.map(async ({ symbol, maturity }) => {
        try {
          const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
          });

          if (!res.ok) return { maturity, yield: null, change: null, percentChange: null, previousClose: null, timestamp: null };

          const data = await res.json();
          const result: YahooChartResult = data.chart?.result?.[0];
          if (!result?.meta) return { maturity, yield: null, change: null, percentChange: null, previousClose: null, timestamp: null };

          const { regularMarketPrice, chartPreviousClose, regularMarketTime } = result.meta;
          const change = regularMarketPrice - chartPreviousClose;
          const percentChange = chartPreviousClose !== 0 ? (change / chartPreviousClose) * 100 : 0;

          return {
            maturity,
            yield: regularMarketPrice,
            change: parseFloat(change.toFixed(3)),
            percentChange: parseFloat(percentChange.toFixed(2)),
            previousClose: chartPreviousClose,
            timestamp: new Date(regularMarketTime * 1000).toISOString(),
          };
        } catch {
          return { maturity, yield: null, change: null, percentChange: null, previousClose: null, timestamp: null };
        }
      })
    );

    return NextResponse.json(
      { yields: results },
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
