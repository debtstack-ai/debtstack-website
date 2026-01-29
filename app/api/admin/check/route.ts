// app/api/admin/check/route.ts
// Verifies if the current user is an admin

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    const isAdmin = ADMIN_EMAILS.includes(email);

    return NextResponse.json({ isAdmin, email });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
