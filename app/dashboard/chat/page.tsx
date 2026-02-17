'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState, Suspense } from 'react';
import ChatLayout from './components/ChatLayout';

interface UserData {
  api_key?: string;
  api_key_prefix?: string;
  tier: string;
  credits_remaining: number;
}

function ChatPageContent() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoaded || !user) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            clerk_id: user.id,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        // If no full key from API, try localStorage (saved from signup or regeneration)
        if (!data.api_key) {
          const savedKey = localStorage.getItem('debtstack_api_key');
          if (savedKey) {
            data.api_key = savedKey;
          }
        }
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userLoaded, user]);

  if (!userLoaded || loading) {
    return (
      <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to access the chat assistant</p>
          <a href="/" className="text-[#2383e2] hover:underline">Go to homepage</a>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/dashboard" className="text-[#2383e2] hover:underline">Back to dashboard</a>
        </div>
      </main>
    );
  }

  if (!userData?.api_key) {
    return (
      <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">API Key Required</h2>
          <p className="text-gray-500 mb-4">
            The chat assistant requires your API key. Your key is only available right after signup
            or regeneration.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Go to Dashboard to Regenerate Key
          </a>
        </div>
      </main>
    );
  }

  return <ChatLayout apiKey={userData.api_key} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#EAECF0] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </main>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
