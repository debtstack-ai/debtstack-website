import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';

// PATCH /api/workspaces/[id] — update workspace
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    const pool = getPool();

    // Build SET clauses dynamically so we only update fields that were sent
    const setClauses: string[] = ['updated_at = now()'];
    const values: (string | null)[] = [id, userId];
    let paramIndex = 3;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex}`);
      values.push(name?.trim() || null);
      paramIndex++;
    }
    if (color !== undefined) {
      setClauses.push(`color = $${paramIndex}`);
      values.push(color);
      paramIndex++;
    }

    const { rowCount } = await pool.query(
      `UPDATE chat_workspaces
       SET ${setClauses.join(', ')}
       WHERE id = $1 AND clerk_id = $2`,
      values
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workspaces/[id] — delete workspace (sessions become uncategorized)
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
      `DELETE FROM chat_workspaces WHERE id = $1 AND clerk_id = $2`,
      [id, userId]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
