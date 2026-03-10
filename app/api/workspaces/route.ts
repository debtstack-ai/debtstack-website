import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';

// GET /api/workspaces — list user's workspaces
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT w.id, w.name, w.color, w.created_at, w.updated_at,
              COUNT(s.id)::int AS session_count
       FROM chat_workspaces w
       LEFT JOIN chat_sessions s ON s.workspace_id = w.id
       WHERE w.clerk_id = $1
       GROUP BY w.id
       ORDER BY w.updated_at DESC`,
      [userId]
    );
    return NextResponse.json({ workspaces: rows });
  } catch (error) {
    console.error('Failed to list workspaces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workspaces — create workspace
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const pool = getPool();
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO chat_workspaces (id, clerk_id, name, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, color, created_at, updated_at`,
      [id, userId, name.trim(), color || null]
    );

    return NextResponse.json({ workspace: { ...rows[0], session_count: 0 } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
