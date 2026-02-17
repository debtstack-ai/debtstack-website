'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatPreview from './components/ChatPreview';

export default function PublicChatPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // If user is already signed in, redirect to the real chat
  useEffect(() => {
    if (isLoaded && user) {
      router.replace('/dashboard/chat');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  // Only render preview for unauthenticated users
  if (user) return null;

  return <ChatPreview />;
}
