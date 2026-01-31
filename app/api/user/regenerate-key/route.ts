// app/api/user/regenerate-key/route.ts
// Regenerates API key for authenticated user

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `ds_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = key.substring(0, 7);
  // Hash the key for storage (using SHA-256)
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, prefix, hash };
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Generate new API key
    const { key, prefix, hash } = generateApiKey();

    // Update in database
    const pool = getPool();
    const result = await pool.query(
      `UPDATE users
       SET api_key_hash = $1, api_key_prefix = $2, updated_at = NOW()
       WHERE email = $3
       RETURNING email, api_key_prefix, tier`,
      [hash, prefix, email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the full key (only time user will see it)
    return NextResponse.json({
      api_key: key,
      api_key_prefix: prefix,
      message: 'API key regenerated. Save this key - it will not be shown again.',
    });

  } catch (error) {
    console.error('Regenerate key error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to regenerate key: ${errorMsg}` },
      { status: 500 }
    );
  }
}
