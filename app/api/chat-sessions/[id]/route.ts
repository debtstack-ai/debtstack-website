import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';

// GET /api/chat-sessions/[id] — load full session with messages
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, title, messages, total_cost, created_at, updated_at, workspace_id
       FROM chat_sessions
       WHERE id = $1 AND clerk_id = $2`,
      [id, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: rows[0] });
  } catch (error) {
    console.error('Failed to fetch chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chat-sessions/[id] — delete session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const pool = getPool();
    await pool.query(
      `DELETE FROM chat_sessions WHERE id = $1 AND clerk_id = $2`,
      [id, userId]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
