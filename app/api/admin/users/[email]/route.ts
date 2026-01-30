// app/api/admin/users/[email]/route.ts
// Admin operations for a specific user

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getPool } from '@/lib/db';

interface RouteParams {
  params: Promise<{ email: string }>;
}

// GET - Get single user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, email, api_key_prefix, tier,
              stripe_customer_id, stripe_subscription_id, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [decodedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (tier, is_active)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const body = await request.json();

    const pool = getPool();

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (body.tier !== undefined) {
      const validTiers = ['free', 'pro', 'business'];
      if (!validTiers.includes(body.tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
      updates.push(`tier = $${paramIndex}`);
      values.push(body.tier);
      paramIndex++;

    }

    if (body.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(body.is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(decodedEmail);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const pool = getPool();
    const result = await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE email = $1 RETURNING *`,
      [decodedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0], message: 'User deactivated' });
  } catch (error) {
    console.error('Admin deactivate user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
