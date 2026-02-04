// app/pricing/page.tsx
'use client';

import { SignUpButton, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

const tiers = [
  {
    name: 'Pay-as-You-Go',
    tier: 'pay_as_you_go',
    price: '$0',
    period: '/month',
    priceNote: '+ pay per API call',
    description: 'Perfect for testing and light usage.',
    features: [
      'Access to all basic APIs',
      'Pay per call ($0.05-$0.15)',
      '60 requests/minute',
      'No monthly commitment',
      'Credits never expire',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '$199',
    period: '/month',
    description: 'Unlimited queries for production apps.',
    features: [
      'Unlimited API queries',
      '100 requests/minute',
      '200+ companies coverage',
      '3,000+ debt instruments',
      'Real-time bond pricing & YTM',
      'Leverage & coverage ratios',
      'Corporate hierarchy & guarantors',
      'Covenant analysis',
      'Indenture & credit agreement search',
      'Email support (48hr)',
    ],
    cta: 'Sign up',
    highlighted: true,
  },
  {
    name: 'Business',
    tier: 'business',
    price: '$499',
    period: '/month',
    description: 'Full access with team features.',
    features: [
      'Everything in Pro, plus:',
      '500 requests/minute',
      '5 team seats',
      'Covenant comparison',
      'Historical bond pricing',
      'Bulk data export',
      'Usage analytics',
      'Priority support (24hr)',
      'Custom coverage requests',
      '99.9% uptime SLA',
    ],
    cta: 'Contact sales',
    highlighted: false,
    isEnterprise: true,
  },
];

const endpointCosts = [
  { category: 'Simple', cost: '$0.05', endpoints: '/companies, /bonds, /bonds/resolve, /financials, /collateral, /covenants' },
  { category: 'Complex', cost: '$0.10', endpoints: '/companies/{ticker}/changes' },
  { category: 'Advanced', cost: '$0.15', endpoints: '/entities/traverse, /documents/search, /batch' },
];

const creditPackages = [
  { amount: '$10', queries: '~200 simple queries' },
  { amount: '$25', queries: '~500 simple queries' },
  { amount: '$50', queries: '~1,000 simple queries' },
  { amount: '$100', queries: '~2,000 simple queries' },
];

const businessOnlyFeatures = [
  { endpoint: '/v1/covenants/compare', description: 'Compare covenants across multiple companies' },
  { endpoint: '/v1/bonds/{cusip}/pricing/history', description: 'Historical bond pricing data (up to 2 years)' },
  { endpoint: '/v1/export', description: 'Bulk data export (up to 50,000 records)' },
  { endpoint: '/v1/usage/analytics', description: 'Detailed usage analytics and trends' },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'pro' | 'business') => {
    try {
      setLoading(tier);
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
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#EDF5F1] text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/#demo" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Demo
            </a>
            <a href="/pricing" className="text-gray-900 transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Blog
            </a>
            <a href="https://docs.debtstack.ai" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Docs
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Start free with Pay-as-You-Go. Upgrade to Pro or Business when you need more.
          </p>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-8 rounded-2xl border flex flex-col ${
                  tier.highlighted
                    ? 'bg-gray-50 border-gray-900 scale-105'
                    : 'bg-white border-gray-200'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-900 text-white rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-4">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-gray-400">{tier.period}</span>}
                  </div>
                  {tier.priceNote && (
                    <p className="text-sm text-[#2383e2] mt-1">{tier.priceNote}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-3">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.isEnterprise ? (
                  <>
                    <SignedOut>
                      <a
                        href="mailto:hello@debtstack.ai"
                        className="block w-full py-3 rounded-lg font-semibold text-center transition bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {tier.cta}
                      </a>
                    </SignedOut>
                    <SignedIn>
                      <button
                        onClick={() => handleUpgrade('business')}
                        disabled={loading === 'business'}
                        className="w-full py-3 rounded-lg font-semibold text-center transition bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                      >
                        {loading === 'business' ? 'Loading...' : 'Upgrade to Business'}
                      </button>
                    </SignedIn>
                  </>
                ) : tier.tier === 'pro' ? (
                  <>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button
                          className="w-full py-3 rounded-lg font-semibold transition bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          {tier.cta}
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <button
                        onClick={() => handleUpgrade('pro')}
                        disabled={loading === 'pro'}
                        className="w-full py-3 rounded-lg font-semibold text-center transition bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                      >
                        {loading === 'pro' ? 'Loading...' : 'Upgrade to Pro'}
                      </button>
                    </SignedIn>
                  </>
                ) : (
                  <SignUpButton mode="modal">
                    <button
                      className="w-full py-3 rounded-lg font-semibold transition bg-gray-100 hover:bg-gray-200 text-gray-900"
                    >
                      {tier.cta}
                    </button>
                  </SignUpButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pay-as-You-Go Cost Breakdown */}
      <section className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Pay-as-You-Go Pricing</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Endpoint Costs */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Cost per API Call</h3>
              <div className="space-y-4">
                {endpointCosts.map((item) => (
                  <div key={item.category} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-emerald-600 font-mono">{item.cost}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{item.endpoints}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Packages */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Credit Packages</h3>
              <p className="text-sm text-gray-500 mb-4">
                Pre-purchase credits for a predictable budget.
              </p>
              <div className="space-y-3">
                {creditPackages.map((pkg) => (
                  <div key={pkg.amount} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
                    <span className="font-mono font-semibold text-[#2383e2]">{pkg.amount}</span>
                    <span className="text-sm text-gray-500">{pkg.queries}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business-Only Features */}
      <section className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Business-Only Features</h2>
          <p className="text-gray-500 text-center mb-8">
            These advanced endpoints are exclusively available on the Business tier.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {businessOnlyFeatures.map((feature) => (
              <div key={feature.endpoint} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <code className="text-[#2383e2] text-sm font-mono">{feature.endpoint}</code>
                <p className="text-gray-600 text-sm mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-4 font-medium text-gray-500">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">Pay-as-You-Go</th>
                  <th className="text-center py-4 px-4 font-medium text-[#2383e2]">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 pr-4">Monthly Price</td>
                  <td className="text-center py-4 px-4">$0 + usage</td>
                  <td className="text-center py-4 px-4 text-[#2383e2]">$199</td>
                  <td className="text-center py-4 px-4">$499</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">API Queries</td>
                  <td className="text-center py-4 px-4">Pay per call</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Rate Limit</td>
                  <td className="text-center py-4 px-4">60/min</td>
                  <td className="text-center py-4 px-4">100/min</td>
                  <td className="text-center py-4 px-4">500/min</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Team Seats</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">5</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Companies</td>
                  <td className="text-center py-4 px-4">200+</td>
                  <td className="text-center py-4 px-4">200+</td>
                  <td className="text-center py-4 px-4">200+</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Bond Pricing</td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Historical Pricing</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Covenant Comparison</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Bulk Export</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Usage Analytics</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Priority Support</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">Custom Coverage</td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><XIcon /></td>
                  <td className="text-center py-4 px-4"><CheckIcon /></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4">SLA</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">99.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-2">How does Pay-as-You-Go billing work?</h3>
              <p className="text-gray-500 text-sm">
                You pre-purchase credit packages ($10, $25, $50, or $100) and pay per API call based on endpoint complexity. Simple endpoints cost $0.05, complex cost $0.10, and advanced cost $0.15.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-2">Can I upgrade from Pay-as-You-Go to Pro?</h3>
              <p className="text-gray-500 text-sm">
                Yes, upgrade instantly from your dashboard. Any remaining credits stay in your account and can be used if you later downgrade.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-2">What&apos;s the difference between Pro and Business?</h3>
              <p className="text-gray-500 text-sm">
                Business includes advanced features: covenant comparison, historical pricing, bulk export, usage analytics, 5 team seats, and priority support with 99.9% SLA.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-2">What data is included?</h3>
              <p className="text-gray-500 text-sm">
                All tiers include full access to 200+ companies, 3,000+ debt instruments, 13,000+ SEC document sections, and real-time bond pricing from FINRA TRACE.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-semibold mb-2">Do credits expire?</h3>
              <p className="text-gray-500 text-sm">
                No, purchased credits never expire. They remain in your account until used.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-32 w-auto invert" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a href="/#demo" className="hover:text-gray-900 transition">Demo</a>
              <a href="/pricing" className="hover:text-gray-900 transition">Pricing</a>
              <a href="/blog" className="hover:text-gray-900 transition">Blog</a>
              <a href="https://docs.debtstack.ai" className="hover:text-gray-900 transition">Docs</a>
              <a href="mailto:hello@debtstack.ai" className="hover:text-gray-900 transition">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            &copy; 2026 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
