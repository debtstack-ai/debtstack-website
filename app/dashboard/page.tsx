// app/dashboard/page.tsx
'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import OnboardingFlow from "./components/OnboardingFlow";

interface UserData {
  api_key?: string;
  api_key_prefix?: string;
  tier: string;
  credits_remaining: number;
  credits_daily_limit?: number;
  credits_monthly_limit?: number;
  created_at?: string;
}

function DashboardContent() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Check for upgrade success
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true);
      // Remove the query param from URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // Check localStorage for onboarding dismissal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOnboardingDismissed(localStorage.getItem('onboarding_dismissed') === 'true');
    }
  }, []);

  useEffect(() => {
    if (userLoaded && user) {
      posthog?.capture('viewed_dashboard');
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
      // If the API returned a full key (new user), persist it in localStorage
      if (data.api_key) {
        localStorage.setItem('debtstack_api_key', data.api_key);
      } else {
        // Try to restore from localStorage (key saved from signup or regeneration)
        const savedKey = localStorage.getItem('debtstack_api_key');
        if (savedKey) {
          data.api_key = savedKey;
        }
      }
      setUserData(data);
      if (data.is_new) {
        setIsNewUser(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    if (userData?.api_key) {
      await navigator.clipboard.writeText(userData.api_key);
      posthog?.capture('copied_api_key');
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
      // Persist the new key in localStorage so chat page can access it
      if (data.api_key) {
        localStorage.setItem('debtstack_api_key', data.api_key);
      }
      setUserData(prev => prev ? { ...prev, api_key: data.api_key, api_key_prefix: data.api_key_prefix } : null);
      setShowApiKey(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  const handleUpgrade = async (tier: 'pro' | 'business') => {
    try {
      setUpgrading(true);
      setError(null);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start upgrade');
      setUpgrading(false);
    }
  };

  const handleDismissOnboarding = useCallback(() => {
    setOnboardingDismissed(true);
    localStorage.setItem('onboarding_dismissed', 'true');
  }, []);

  const handleManageBilling = async () => {
    try {
      setError(null);

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    }
  };

  if (!userLoaded || loading) {
    return (
      <main className="min-h-screen bg-[#EAECF0] text-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#EAECF0] text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to access your dashboard</p>
          <a href="/" className="text-[#2383e2] hover:underline">Go to homepage</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAECF0] text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">{user.primaryEmailAddress?.emailAddress}</span>
            <a href="/dashboard/chat" className="px-3 py-1 rounded-full bg-[#2383e2] text-white text-sm font-medium hover:bg-[#1a6bc4] transition">
              Ask Medici
            </a>
            <a href="/" className="text-gray-500 hover:text-gray-900 text-sm transition">Home</a>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {isNewUser && !onboardingDismissed && userData?.api_key && (
          <OnboardingFlow
            apiKey={userData.api_key}
            creditsRemaining={userData.credits_remaining}
            onUpgrade={handleUpgrade}
            onDismiss={handleDismissOnboarding}
          />
        )}

        {showUpgradeSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            Welcome to {userData?.tier === 'business' ? 'Business' : 'Pro'}! Your account has been upgraded.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* API Key Section */}
        <section className="mb-8 p-6 rounded-xl bg-white border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">API Key</h2>

          {userData?.api_key ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                Your API key is ready! You have <strong>$5 in free credits</strong> to get started — no credit card required.
              </div>
              <div className="flex items-center gap-4">
                <code className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 font-mono text-sm text-gray-900">
                  {showApiKey ? userData.api_key : `${userData.api_key_prefix}${'•'.repeat(24)}`}
                </code>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copyApiKey}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Use this key in the <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">X-API-Key</code> header for all API requests.
              </p>

              <button
                onClick={regenerateApiKey}
                disabled={regenerating}
                className="text-sm text-red-600 hover:text-red-500 transition disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
              </button>
            </div>
          ) : userData?.api_key_prefix ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <code className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 font-mono text-sm text-gray-500">
                  {userData.api_key_prefix}{'•'.repeat(24)}
                </code>
              </div>

              <p className="text-sm text-amber-600">
                Your API key is stored securely. If you lost your key, regenerate it below.
              </p>

              <button
                onClick={regenerateApiKey}
                disabled={regenerating}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm transition disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Loading API key...</p>
          )}
        </section>

        {/* Usage Section */}
        <section className="mb-8 p-6 rounded-xl bg-white border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Queries Remaining</p>
              <p className="text-2xl font-bold">
                {userData?.tier === 'pro' || userData?.tier === 'business'
                  ? 'Unlimited'
                  : (userData?.credits_remaining?.toLocaleString() ?? '—')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">
                Query Limit
              </p>
              <p className="text-2xl font-bold">
                {userData?.tier === 'pro' || userData?.tier === 'business'
                  ? 'Unlimited'
                  : (userData?.credits_daily_limit?.toLocaleString() ?? userData?.credits_monthly_limit?.toLocaleString() ?? '5')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <p className="text-2xl font-bold capitalize">
                {userData?.tier === 'free' || userData?.tier === 'pay_as_you_go'
                  ? 'Pay-as-You-Go'
                  : userData?.tier ?? '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Chat Assistant CTA */}
        {userData?.api_key ? (
          <section className="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#2383e2]/30">
            <h2 className="text-xl font-semibold mb-2">Chat Assistant</h2>
            <p className="text-gray-500 mb-4">
              Ask questions about corporate debt in natural language. Powered by Claude + DebtStack API.
            </p>
            <a
              href="/dashboard/chat"
              className="inline-block px-6 py-3 rounded-lg bg-[#2383e2] text-white text-sm font-semibold hover:bg-[#1a6bc4] transition"
            >
              Open Chat &rarr;
            </a>
          </section>
        ) : userData?.api_key_prefix ? (
          <div className="mb-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            Regenerate your API key above to enable the chat assistant.
          </div>
        ) : null}

        {/* Quick Start Section */}
        <section className="p-6 rounded-xl bg-white border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Example request:</p>
              <pre className="p-4 rounded-lg bg-gray-900 border border-gray-200 overflow-x-auto text-sm">
                <code className="text-green-400">{`curl -H "X-API-Key: ${userData?.api_key_prefix || 'ds_'}..." \\
  "https://api.debtstack.ai/v1/companies?ticker=AAPL"`}</code>
              </pre>
            </div>

            <div className="flex gap-4">
              <a
                href="https://docs.debtstack.ai"
                className="text-[#2383e2] hover:underline text-sm"
              >
                View Documentation →
              </a>
              <a
                href="https://docs.debtstack.ai/api-reference/overview"
                className="text-[#2383e2] hover:underline text-sm"
              >
                API Reference →
              </a>
            </div>
          </div>
        </section>

        {/* Upgrade CTA for Free Users */}
        {(userData?.tier === 'free' || userData?.tier === 'pay_as_you_go') && (
          <section className="mt-8 p-6 rounded-xl bg-white border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Need unlimited queries?</h2>
            <p className="text-gray-500 mb-4">
              Upgrade to Pro for unlimited queries at 100 requests/minute, or Business for advanced features.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={upgrading}
                className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition disabled:opacity-50"
              >
                {upgrading ? 'Loading...' : 'Upgrade to Pro — $199/mo'}
              </button>
              <button
                onClick={() => handleUpgrade('business')}
                disabled={upgrading}
                className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition disabled:opacity-50"
              >
                {upgrading ? 'Loading...' : 'Upgrade to Business — $499/mo'}
              </button>
              <a
                href="mailto:debtstackai@gmail.com"
                className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold transition"
              >
                Contact Sales
              </a>
            </div>
          </section>
        )}

        {/* Billing Management for Paid Users */}
        {(userData?.tier === 'pro' || userData?.tier === 'business') && (
          <section className="mt-8 p-6 rounded-xl bg-white border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Billing</h2>
            <p className="text-gray-500 mb-4">
              Manage your subscription, update payment methods, or view invoices.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleManageBilling}
                className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold transition"
              >
                Manage Billing
              </button>
              {userData?.tier === 'pro' && (
                <button
                  onClick={() => handleUpgrade('business')}
                  disabled={upgrading}
                  className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition disabled:opacity-50"
                >
                  {upgrading ? 'Loading...' : 'Upgrade to Business — $499/mo'}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#EAECF0] text-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}
