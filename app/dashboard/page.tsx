// app/dashboard/page.tsx
'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UserData {
  api_key?: string;
  api_key_prefix?: string;
  tier: string;
  credits_remaining: number;
  credits_monthly_limit: number;
  created_at?: string;
}

export default function Dashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (userLoaded && user) {
      fetchOrCreateUser();
    }
  }, [userLoaded, user]);

  const fetchOrCreateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get existing user data from our backend
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
          clerk_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    if (userData?.api_key) {
      await navigator.clipboard.writeText(userData.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure? Your old API key will stop working immediately.')) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await fetch('/api/user/regenerate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }

      const data = await response.json();
      setUserData(prev => prev ? { ...prev, api_key: data.api_key, api_key_prefix: data.api_key_prefix } : null);
      setShowApiKey(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  if (!userLoaded || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to access your dashboard</p>
          <a href="/" className="text-blue-400 hover:text-blue-300">Go to homepage</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-16 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</span>
            <a href="/" className="text-gray-400 hover:text-white text-sm">Home</a>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* API Key Section */}
        <section className="mb-8 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">API Key</h2>

          {userData?.api_key ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <code className="flex-1 px-4 py-3 rounded-lg bg-black border border-gray-700 font-mono text-sm">
                  {showApiKey ? userData.api_key : `${userData.api_key_prefix}${'•'.repeat(24)}`}
                </code>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copyApiKey}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-sm text-gray-400">
                Use this key in the <code className="text-gray-300">X-API-Key</code> header for all API requests.
              </p>

              <button
                onClick={regenerateApiKey}
                disabled={regenerating}
                className="text-sm text-red-400 hover:text-red-300 transition disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400">Loading API key...</p>
          )}
        </section>

        {/* Usage Section */}
        <section className="mb-8 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-black border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Credits Remaining</p>
              <p className="text-2xl font-bold">
                {userData?.credits_remaining?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Monthly Limit</p>
              <p className="text-2xl font-bold">
                {userData?.credits_monthly_limit?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Current Plan</p>
              <p className="text-2xl font-bold capitalize">
                {userData?.tier ?? '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Example request:</p>
              <pre className="p-4 rounded-lg bg-black border border-gray-700 overflow-x-auto text-sm">
                <code className="text-green-400">{`curl -H "X-API-Key: ${userData?.api_key_prefix || 'ds_'}..." \\
  "https://credible-ai-production.up.railway.app/v1/companies?ticker=AAPL"`}</code>
              </pre>
            </div>

            <div className="flex gap-4">
              <a
                href="https://docs.debtstack.ai"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Documentation →
              </a>
              <a
                href="https://credible-ai-production.up.railway.app/docs"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                API Reference →
              </a>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        {userData?.tier === 'free' && (
          <section className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
            <h2 className="text-xl font-semibold mb-2">Need more credits?</h2>
            <p className="text-gray-400 mb-4">
              Upgrade to a paid plan for higher limits and pay-as-you-go overage.
            </p>
            <div className="flex gap-4">
              <a
                href="/pricing"
                className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition"
              >
                View Pricing
              </a>
              <a
                href="mailto:hello@debtstack.ai"
                className="inline-block px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition"
              >
                Contact Sales
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
