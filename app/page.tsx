// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const DEBT_STRUCTURE_EXAMPLE = {
  id: 'debt-structure',
  label: 'Debt Structure',
  query: "What's RIG's debt structure and leverage?",
  header: { name: 'Transocean Ltd. (RIG)', sector: 'Energy — Offshore Drilling', leverage: '5.6x Leverage' },
  bonds: [
    { name: 'RIG 8.75% Sr Secured', seniority: '1st Lien', seniorityColor: 'text-emerald-600', coupon: '8.750%', maturity: 'Feb 2030' },
    { name: 'RIG 8.50% Sr Secured', seniority: '1st Lien', seniorityColor: 'text-emerald-600', coupon: '8.500%', maturity: 'May 2031' },
    { name: 'RIG 6.875% Sr Unsecured', seniority: 'Sr Unsecured', seniorityColor: 'text-amber-600', coupon: '6.875%', maturity: 'Feb 2027' },
  ],
};

const BOND_SEARCH_EXAMPLE = {
  id: 'bond-search',
  label: 'Bond Pricing',
  query: 'Find energy bonds yielding above 8%',
  results: [
    { ticker: 'SWN', name: 'Southwestern Energy 5.375% 2030', ytm: '8.42%', spread: '+410 bps', price: '$88.25' },
    { ticker: 'RIG', name: 'Transocean 8.00% 2027', ytm: '9.66%', spread: '+528 bps', price: '$96.50' },
    { ticker: 'CRC', name: 'California Resources 7.125% 2026', ytm: '8.15%', spread: '+382 bps', price: '$97.80' },
    { ticker: 'BORR', name: 'Borr Drilling 10.00% 2028', ytm: '9.12%', spread: '+475 bps', price: '$102.10' },
  ],
};

const COVENANT_EXAMPLE = {
  id: 'covenant-analysis',
  label: 'Covenant Analysis',
  query: 'Compare covenants on RIG 8.75% 2030 vs RIG 6.875% 2027',
  bonds: ['RIG 8.75% Sr Secured 2030', 'RIG 6.875% Sr Unsecured 2027'],
  rows: [
    { label: 'Seniority', values: ['1st Lien Secured', 'Sr Unsecured'], highlights: ['text-emerald-600', 'text-amber-600'] },
    { label: 'Debt Incurrence', values: ['≤ 3.5x Secured Leverage', 'No Restriction'], highlights: ['text-gray-900', 'text-red-500'] },
    { label: 'Restricted Payments', values: ['Builder Basket + 50% CNI', 'Unlimited above 2.0x Coverage'], highlights: ['text-gray-900', 'text-gray-900'] },
    { label: 'Change of Control', values: ['101% Put', '101% Put'], highlights: ['text-gray-900', 'text-gray-900'] },
    { label: 'Asset Sale Proceeds', values: ['75% Cash Consideration', 'No Requirement'], highlights: ['text-gray-900', 'text-red-500'] },
    { label: 'Guarantees', values: ['Subsidiary Guarantee', 'None'], highlights: ['text-emerald-600', 'text-red-500'] },
  ],
};

const EXAMPLES = [DEBT_STRUCTURE_EXAMPLE, BOND_SEARCH_EXAMPLE, COVENANT_EXAMPLE];

export default function Home() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeExample, setActiveExample] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const hasAnimatedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateQuery = useCallback((exampleIndex: number) => {
    const query = EXAMPLES[exampleIndex].query;
    setTypedText('');
    setShowOutput(false);
    setIsTyping(true);

    let i = 0;
    const type = () => {
      if (i < query.length) {
        setTypedText(query.slice(0, i + 1));
        i++;
        typingTimeoutRef.current = setTimeout(type, 30);
      } else {
        setIsTyping(false);
        typingTimeoutRef.current = setTimeout(() => setShowOutput(true), 400);
      }
    };
    typingTimeoutRef.current = setTimeout(type, 200);
  }, []);

  const switchExample = useCallback((index: number) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setActiveExample(index);
    animateQuery(index);
  }, [animateQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            // Trigger typing animation for example section
            if (entry.target.id === 'example-output' && !hasAnimatedRef.current) {
              hasAnimatedRef.current = true;
              animateQuery(0);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [animateQuery]);

  return (
    <main className="min-h-screen bg-[#EAECF0] text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/pricing" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Blog
            </a>
            <a href="https://docs.debtstack.ai" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Docs
            </a>
            <SignedOut>
              <a href="/chat" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Chat
              </a>
              <SignInButton mode="modal">
                <button className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard/chat" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Chat
              </a>
              <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
            Credit Data
            <br />
            <span className="text-[#2383e2]">Built for Every Workflow</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Debt structures, bond pricing, covenant analysis, and corporate hierarchies — via chat, API, or agent tooling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition">
                  Get Started — $5 Free Credits
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard/chat"
                className="bg-[#2383e2] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#1a6bc4] transition"
              >
                Open Chat Assistant
              </a>
              <a
                href="/dashboard"
                className="text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:text-gray-900 transition border border-gray-200 hover:border-gray-300"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <SignedOut>
              <a
                href="/chat"
                className="text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:text-gray-900 transition border border-gray-200 hover:border-gray-300"
              >
                Try Chat Assistant
              </a>
            </SignedOut>
          </div>
          <p className="mt-4 text-sm text-gray-400">Pay only for what you use. No monthly commitment required.</p>
        </div>
      </section>

      {/* Example Output Section */}
      <section
        id="example-output"
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="px-6 py-16 border-t border-gray-100 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-400 mb-4 text-sm uppercase tracking-widest">Example Queries</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Query Debt Structures, Bond Pricing, and Corporate Hierarchies
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Search across 250+ corporate issuers and 5,000+ bonds. Pull leverage ratios, seniority, TRACE pricing, and full subsidiary trees through a single API.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => switchExample(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeExample === i
                    ? 'bg-gray-900 text-white'
                    : 'bg-white/60 text-gray-500 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Query + Output Card */}
          <div className="bg-[#D5D8DF] rounded-2xl p-6 md:p-8 border border-gray-300/50 shadow-sm">
            {/* Query input */}
            <div className="flex items-center gap-3 mb-6 bg-white rounded-xl px-4 py-3 border border-gray-200">
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <span className="text-sm text-gray-900 font-mono">
                {typedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-[#2383e2] ml-0.5 animate-pulse align-middle" />}
              </span>
            </div>

            {/* Output */}
            <div className={`transition-all duration-500 ${showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              {/* Loading indicator */}
              {!showOutput && isTyping && null}

              {activeExample === 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm">
                    <span className="font-semibold text-gray-900">{DEBT_STRUCTURE_EXAMPLE.header.name}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{DEBT_STRUCTURE_EXAMPLE.header.sector}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-[#2383e2] font-semibold">{DEBT_STRUCTURE_EXAMPLE.header.leverage}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-100">
                          <th className="pb-2 pr-4 font-medium">Bond</th>
                          <th className="pb-2 pr-4 font-medium">Seniority</th>
                          <th className="pb-2 pr-4 font-medium">Coupon</th>
                          <th className="pb-2 font-medium">Maturity</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {DEBT_STRUCTURE_EXAMPLE.bonds.map((bond, i) => (
                          <tr key={i} className={i < DEBT_STRUCTURE_EXAMPLE.bonds.length - 1 ? 'border-b border-gray-50' : ''}>
                            <td className="py-2.5 pr-4 font-medium">{bond.name}</td>
                            <td className={`py-2.5 pr-4 ${bond.seniorityColor}`}>{bond.seniority}</td>
                            <td className="py-2.5 pr-4">{bond.coupon}</td>
                            <td className="py-2.5">{bond.maturity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeExample === 1 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-gray-500">{BOND_SEARCH_EXAMPLE.results.length} bonds found</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">Sector: Energy</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">Min YTM: 8%</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-100">
                          <th className="pb-2 pr-4 font-medium">Ticker</th>
                          <th className="pb-2 pr-4 font-medium">Bond</th>
                          <th className="pb-2 pr-4 font-medium">YTM</th>
                          <th className="pb-2 pr-4 font-medium">Spread</th>
                          <th className="pb-2 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {BOND_SEARCH_EXAMPLE.results.map((bond, i) => (
                          <tr key={i} className={i < BOND_SEARCH_EXAMPLE.results.length - 1 ? 'border-b border-gray-50' : ''}>
                            <td className="py-2.5 pr-4 font-semibold text-[#2383e2]">{bond.ticker}</td>
                            <td className="py-2.5 pr-4 font-medium">{bond.name}</td>
                            <td className="py-2.5 pr-4">{bond.ytm}</td>
                            <td className="py-2.5 pr-4 text-gray-500">{bond.spread}</td>
                            <td className="py-2.5">{bond.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeExample === 2 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-3 pr-4 font-medium text-gray-400 w-1/4">Covenant</th>
                          <th className="pb-3 pr-4 font-medium text-gray-900 w-[37.5%]">{COVENANT_EXAMPLE.bonds[0]}</th>
                          <th className="pb-3 font-medium text-gray-900 w-[37.5%]">{COVENANT_EXAMPLE.bonds[1]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COVENANT_EXAMPLE.rows.map((row, i) => (
                          <tr key={i} className={i < COVENANT_EXAMPLE.rows.length - 1 ? 'border-b border-gray-50' : ''}>
                            <td className="py-2.5 pr-4 text-gray-500 font-medium">{row.label}</td>
                            <td className={`py-2.5 pr-4 ${row.highlights[0]}`}>{row.values[0]}</td>
                            <td className={`py-2.5 ${row.highlights[1]}`}>{row.values[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="px-6 py-16 border-t border-gray-100 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-400 mb-4 text-sm uppercase tracking-widest">Built For Credit Professionals</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Your Workflow, Supercharged
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300">
              <div className="mb-4 flex justify-start">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit Analysts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Screen 250+ issuers by leverage, seniority, and maturity. Instantly pull debt structures and covenants for any name in the universe.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300">
              <div className="mb-4 flex justify-start">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Agent Builders</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Plug structured credit data into your LLM workflows. Tool-use ready with LangChain, MCP, and LlamaIndex integrations.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300">
              <div className="mb-4 flex justify-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16a1 1 0 001 1h14a1 1 0 001-1V4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quant Researchers</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Programmatic access to 5,000+ bonds with pricing, spreads, and corporate structure data via REST API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="get-started"
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="px-6 py-20 border-t border-gray-100 opacity-0"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to Build?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Pay only for what you use. No monthly commitment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="/pricing"
              className="text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:text-gray-900 transition border border-gray-200 hover:border-gray-300"
            >
              View Pricing
            </a>
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
