// app/api/user/route.ts
// Syncs Clerk users with DebtStack backend and returns API key

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const BACKEND_URL = process.env.BACKEND_URL || 'https://credible-ai-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { email, clerk_id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // First, check if user exists in database
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT email, api_key, api_key_prefix, tier, credits_remaining, credits_monthly, is_active
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return NextResponse.json({
          api_key: user.api_key,
          api_key_prefix: user.api_key_prefix,
          tier: user.tier,
          credits_remaining: user.credits_remaining,
          credits_monthly_limit: user.credits_monthly,
          is_new: false,
        });
      }
    } catch (dbError) {
      // Database not configured, fall back to backend API
      console.log('Database not available, using backend API');
    }

    // User doesn't exist in DB, try to create via backend signup
    const signupResponse = await fetch(`${BACKEND_URL}/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (signupResponse.ok) {
      // New user created
      const data = await signupResponse.json();
      return NextResponse.json({
        api_key: data.api_key,
        api_key_prefix: data.api_key_prefix,
        tier: data.tier,
        credits_remaining: data.credits_monthly,
        credits_monthly_limit: data.credits_monthly,
        is_new: true,
      });
    }

    // User might already exist (400 error) but DB query failed
    if (signupResponse.status === 400) {
      return NextResponse.json({
        api_key: null,
        api_key_prefix: null,
        tier: 'free',
        credits_remaining: 25,
        credits_daily_limit: 25,
        is_new: false,
        message: 'Account exists. If you lost your API key, regenerate it below.',
      });
    }

    // Other error
    const errorData = await signupResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.detail || 'Failed to sync user' },
      { status: signupResponse.status }
    );

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
