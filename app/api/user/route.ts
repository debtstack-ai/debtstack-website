// app/api/user/route.ts
// Syncs Clerk users with DebtStack backend and returns API key

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://credible-ai-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { email, clerk_id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Try to get existing user from our backend
    // If user doesn't exist, create them via signup
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

    // User might already exist (400 error)
    if (signupResponse.status === 400) {
      // User exists - we can't retrieve their API key (security)
      // They need to regenerate if they lost it
      // For now, return a placeholder indicating they have an account
      return NextResponse.json({
        api_key: null,
        api_key_prefix: null,
        tier: 'free',
        credits_remaining: 1000,
        credits_monthly_limit: 1000,
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
