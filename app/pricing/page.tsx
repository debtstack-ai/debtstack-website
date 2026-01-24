// app/pricing/page.tsx
'use client';

import { SignUpButton, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Explore the API and build prototypes.',
    features: [
      '2-3 queries per day',
      'Corporate structure data',
      'Debt instruments & terms',
      'SEC document search',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For developers building production applications.',
    features: [
      'Unlimited queries',
      'Real-time bond pricing',
      'Higher rate limits',
      'Priority support',
    ],
    cta: 'Get Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs.',
    features: [
      'Everything in Pro',
      'Historical pricing data',
      'Custom integrations & SLA',
      'Dedicated support',
    ],
    cta: 'Contact Us',
    highlighted: false,
    isEnterprise: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative px-6 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-16 md:h-24 w-auto" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/#demo" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Demo
            </a>
            <a href="/explorer" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Explorer
            </a>
            <a href="/pricing" className="text-white transition text-sm font-medium">
              Pricing
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-400 hover:text-white transition text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard" className="text-gray-400 hover:text-white transition text-sm font-medium">
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
            Simple Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-8 rounded-2xl border ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-blue-900/30 to-gray-900/50 border-blue-500/50 scale-105'
                    : 'bg-gray-900/50 border-gray-800'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-4">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-gray-500">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-3">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {'isEnterprise' in tier && tier.isEnterprise ? (
                  <a
                    href="mailto:hello@debtstack.ai"
                    className="block w-full py-3 rounded-lg font-semibold text-center transition bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button
                          className={`w-full py-3 rounded-lg font-semibold transition ${
                            tier.highlighted
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {tier.cta}
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <a
                        href="/dashboard"
                        className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
                          tier.highlighted
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        Go to Dashboard
                      </a>
                    </SignedIn>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Questions?</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="font-semibold mb-2">What counts as a query?</h3>
              <p className="text-gray-400 text-sm">
                Any API call to our endpoints counts as one query.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="font-semibold mb-2">Can I upgrade anytime?</h3>
              <p className="text-gray-400 text-sm">
                Yes, upgrade to Pro instantly from your dashboard.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="font-semibold mb-2">What data is included?</h3>
              <p className="text-gray-400 text-sm">
                All plans include full access to 189 companies, 2,849 debt instruments, and 5,750+ SEC document sections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-16 w-auto" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a href="/#demo" className="hover:text-white transition">Demo</a>
              <a href="/explorer" className="hover:text-white transition">Explorer</a>
              <a href="/pricing" className="hover:text-white transition">Pricing</a>
              <a href="https://docs.debtstack.ai" className="hover:text-white transition">Docs</a>
              <a href="mailto:hello@debtstack.ai" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-600">
            © 2026 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
