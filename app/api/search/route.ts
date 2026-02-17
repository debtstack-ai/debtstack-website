// app/api/search/route.ts
// Server-side proxy for company & bond search — calls api.debtstack.ai on behalf of the user

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.debtstack.ai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey, type, ticker, offset } = await request.json();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    let path: string;

    if (type === 'companies') {
      const page = Number(offset) || 0;
      path = `/v1/companies?fields=ticker,name,sector,leverage_ratio&limit=100&offset=${page}`;
    } else if (type === 'bonds') {
      if (!ticker) {
        return NextResponse.json({ error: 'Ticker required for bond search' }, { status: 400 });
      }
      path = `/v1/bonds?ticker=${encodeURIComponent(ticker)}&fields=name,cusip,company_ticker,seniority,coupon_rate,maturity_date&limit=50`;
    } else {
      return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'API request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
