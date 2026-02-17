'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';

interface OnboardingFlowProps {
  apiKey: string;
  creditsRemaining: number;
  onUpgrade: (tier: 'pro' | 'business') => void;
  onDismiss: () => void;
}

const DEMO_ENDPOINT = '/v1/companies?ticker=AAPL&fields=ticker,name,total_debt,net_leverage_ratio';

export default function OnboardingFlow({ apiKey, creditsRemaining, onUpgrade, onDismiss }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<{ data: unknown; latency_ms: number } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const posthog = usePostHog();
  const hasTrackedStart = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture('onboarding_started');
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  // Step 1 fallback: auto-advance after 5s
  useEffect(() => {
    if (step === 1) {
      fallbackTimerRef.current = setTimeout(() => {
        setStep(2);
      }, 5000);
      return () => {
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      };
    }
  }, [step]);

  const handleCopyKey = useCallback(async () => {
    await navigator.clipboard.writeText(apiKey);
    posthog?.capture('onboarding_api_key_copied');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setTimeout(() => setStep(2), 600);
  }, [apiKey, posthog]);

  const handleRunQuery = useCallback(async () => {
    posthog?.capture('onboarding_query_executed');
    setQueryLoading(true);
    setQueryError(null);

    try {
      const response = await fetch('/api/proxy-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Query failed');
      }

      setQueryResult(result);
      setTimeout(() => setStep(3), 1000);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setQueryLoading(false);
    }
  }, [apiKey, posthog]);

  const handleSkip = useCallback(() => {
    posthog?.capture('onboarding_skipped', { step });
    onDismiss();
  }, [posthog, step, onDismiss]);

  const handleUpgradeClick = useCallback(() => {
    posthog?.capture('onboarding_upgrade_clicked');
    onUpgrade('pro');
  }, [posthog, onUpgrade]);

  const handleDismiss = useCallback(() => {
    posthog?.capture('onboarding_completed');
    onDismiss();
  }, [posthog, onDismiss]);

  return (
    <section className="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#2383e2]/30">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-[#2383e2]' : s < step ? 'w-2 bg-[#2383e2]/60' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400">Step {step} of 3</span>
        <button
          onClick={handleSkip}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Skip
        </button>
      </div>

      {/* Step 1: API Key Ready */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-1 text-gray-900">Your API key is ready</h2>
          <p className="text-sm text-gray-500 mb-4">Copy your key to get started. Let&apos;s make your first API call.</p>

          <div className="flex items-center gap-3 mb-3">
            <code className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-200 font-mono text-sm text-gray-900 truncate">
              {apiKey}
            </code>
            <button
              onClick={handleCopyKey}
              className="px-5 py-3 rounded-lg bg-[#2383e2] text-white hover:bg-[#1a6bc4] text-sm font-semibold transition flex-shrink-0"
            >
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Make First API Call */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-1 text-gray-900">Make your first API call</h2>
          <p className="text-sm text-gray-500 mb-4">Run this query to see real data from Apple&apos;s SEC filings.</p>

          <pre className="p-4 rounded-lg bg-gray-900 overflow-x-auto text-sm mb-4">
            <code className="text-green-400">{`curl -H "X-API-Key: ${apiKey}" \\
  "https://api.debtstack.ai${DEMO_ENDPOINT}"`}</code>
          </pre>

          <button
            onClick={handleRunQuery}
            disabled={queryLoading}
            className="px-6 py-3 rounded-lg bg-[#2383e2] text-white hover:bg-[#1a6bc4] text-sm font-semibold transition disabled:opacity-50 mb-4"
          >
            {queryLoading ? 'Running...' : 'Run this query'}
          </button>

          {queryError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {queryError}
            </div>
          )}

          {queryResult && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Response ({queryResult.latency_ms}ms):</p>
              <pre className="p-4 rounded-lg bg-gray-900 overflow-x-auto text-sm max-h-64 overflow-y-auto">
                <code className="text-green-400">{JSON.stringify(queryResult.data, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Query Done */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-1 text-gray-900">Your first query is done</h2>
          <p className="text-sm text-gray-500 mb-4">
            That query returned data from 40+ SEC filings, parsed and delivered in{' '}
            <span className="font-semibold text-gray-900">{queryResult?.latency_ms ?? '—'}ms</span>.
          </p>

          <div className="flex gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white border border-gray-200">
              <p className="text-xs text-gray-400">Latency</p>
              <p className="text-lg font-bold text-gray-900">{queryResult?.latency_ms ?? '—'}ms</p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-gray-200">
              <p className="text-xs text-gray-400">Credits remaining</p>
              <p className="text-lg font-bold text-gray-900">{creditsRemaining}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/dashboard/chat"
              className="px-6 py-3 rounded-lg bg-[#2383e2] text-white hover:bg-[#1a6bc4] text-sm font-semibold transition"
            >
              Try Chat Assistant
            </a>
            <button
              onClick={handleUpgradeClick}
              className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition"
            >
              Upgrade to Pro — $199/mo
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Explore the dashboard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
