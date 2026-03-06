import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';

// GET /api/chat-sessions — list sessions (metadata only, no messages)
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, title, total_cost, created_at, updated_at
       FROM chat_sessions
       WHERE clerk_id = $1
       ORDER BY updated_at DESC
       LIMIT 50`,
      [userId]
    );
    return NextResponse.json({ sessions: rows });
  } catch (error) {
    console.error('Failed to list chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat-sessions — upsert session
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, messages, total_cost, created_at } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'id and title required' }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO chat_sessions (id, clerk_id, title, messages, total_cost, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         messages = EXCLUDED.messages,
         total_cost = EXCLUDED.total_cost,
         updated_at = now()
       WHERE chat_sessions.clerk_id = $2`,
      [id, userId, title, JSON.stringify(messages || []), total_cost || 0, created_at || new Date().toISOString()]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to save chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
