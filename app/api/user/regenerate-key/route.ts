// app/api/user/regenerate-key/route.ts
// Regenerates API key for existing user

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://credible-ai-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { email, current_api_key } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // For now, since we can't authenticate without the old key,
    // we'll need to implement a different flow.
    // Option 1: Use Clerk webhook to store API key mapping
    // Option 2: Allow regeneration via email verification

    // For MVP, we'll create a new account if one doesn't exist
    // This is a simplified flow - production should use proper auth

    return NextResponse.json(
      { error: 'Please contact support to regenerate your API key: hello@debtstack.ai' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Regenerate key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
