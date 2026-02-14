// app/api/proxy-query/route.ts
// Server-side proxy for onboarding demo query — calls api.debtstack.ai on behalf of the user

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.debtstack.ai';
const ALLOWED_PATH = '/v1/companies?ticker=AAPL&fields=ticker,name,total_debt,net_leverage_ratio';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey } = await request.json();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    const start = Date.now();

    const response = await fetch(`${BACKEND_URL}${ALLOWED_PATH}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Date.now() - start;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'API request failed', latency_ms: latencyMs },
        { status: response.status }
      );
    }

    return NextResponse.json({
      data,
      latency_ms: latencyMs,
    });
  } catch (error) {
    console.error('Proxy query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
