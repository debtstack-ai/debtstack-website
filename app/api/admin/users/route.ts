// app/api/admin/users/route.ts
// List all users for admin dashboard

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getPool, DbUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const pool = getPool();

    // Build query with filters
    let whereConditions: string[] = [];
    let params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`email ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tier) {
      whereConditions.push(`tier = $${paramIndex}`);
      params.push(tier);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get users with pagination
    const usersQuery = `
      SELECT
        id, email, api_key_prefix, tier,
        credits_remaining, credits_monthly,
        stripe_customer_id, stripe_subscription_id,
        is_active, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const usersResult = await pool.query(usersQuery, params);

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
