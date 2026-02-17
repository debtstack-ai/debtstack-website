// app/api/treasury/route.ts
// Server-side proxy to Twelve Data API for treasury yield data
// Keeps API key out of client bundles

import { NextResponse } from 'next/server';

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

const SYMBOLS = 'US2Y,US5Y,US10Y,US30Y';
const MATURITY_MAP: Record<string, string> = {
  'US2Y': '2Y',
  'US5Y': '5Y',
  'US10Y': '10Y',
  'US30Y': '30Y',
};

interface TwelveDataQuote {
  symbol: string;
  close: string;
  change: string;
  percent_change: string;
  previous_close: string;
  datetime: string;
}

export async function GET() {
  if (!TWELVE_DATA_API_KEY) {
    return NextResponse.json(
      { error: 'Treasury data API key not configured' },
      { status: 503 }
    );
  }

  try {
    const url = `https://api.twelvedata.com/quote?symbol=${SYMBOLS}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch treasury data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Twelve Data returns an object keyed by symbol when multiple symbols are requested
    const yields = Object.entries(MATURITY_MAP).map(([symbol, maturity]) => {
      const quote: TwelveDataQuote = data[symbol];
      if (!quote || quote.close === undefined) {
        return {
          maturity,
          yield: null,
          change: null,
          percentChange: null,
          previousClose: null,
          timestamp: null,
        };
      }
      return {
        maturity,
        yield: parseFloat(quote.close),
        change: parseFloat(quote.change),
        percentChange: parseFloat(quote.percent_change),
        previousClose: parseFloat(quote.previous_close),
        timestamp: quote.datetime,
      };
    });

    return NextResponse.json(
      { yields },
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
