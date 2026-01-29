// lib/admin.ts
// Admin utilities

import { auth, currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export async function isAdmin(): Promise<{ isAdmin: boolean; email: string | null }> {
  const { userId } = await auth();

  if (!userId) {
    return { isAdmin: false, email: null };
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null;

  if (!email) {
    return { isAdmin: false, email: null };
  }

  return { isAdmin: ADMIN_EMAILS.includes(email), email };
}
