import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';

// POST /api/chat-sessions/move — move session to a workspace (without overwriting messages)
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { session_id, workspace_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `UPDATE chat_sessions
       SET workspace_id = $3, updated_at = now()
       WHERE id = $1 AND clerk_id = $2`,
      [session_id, userId, workspace_id || null]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to move session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
