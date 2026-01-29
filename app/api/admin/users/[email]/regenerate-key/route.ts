// app/api/admin/users/[email]/regenerate-key/route.ts
// Admin endpoint to regenerate API key for a user

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

interface RouteParams {
  params: Promise<{ email: string }>;
}

function generateApiKey(): { key: string; prefix: string } {
  const key = `ds_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = key.substring(0, 7);
  return { key, prefix };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const { key, prefix } = generateApiKey();

    const pool = getPool();
    const result = await pool.query(
      `UPDATE users
       SET api_key = $1, api_key_prefix = $2, updated_at = NOW()
       WHERE email = $3
       RETURNING id, email, api_key, api_key_prefix, tier, is_active`,
      [key, prefix, decodedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: result.rows[0],
      message: 'API key regenerated successfully',
    });
  } catch (error) {
    console.error('Admin regenerate key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
