// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const DEBT_STRUCTURE_EXAMPLE = {
  id: 'debt-structure',
  label: 'Debt Structure',
  query: "What's GOOGL's debt stack?",
  header: { name: 'Alphabet Inc. (GOOGL)', sector: 'Technology', leverage: '0.22x Leverage' },
  bonds: [
    { name: 'Revolving Credit Facility', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '--', maturity: 'Apr 2026' },
    { name: 'GOOGL 1.998% Notes due 2026', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '1.998%', maturity: 'Dec 2026' },
    { name: 'GOOGL 0.8% Note due 2027', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '0.800%', maturity: 'Aug 2027' },
    { name: 'GOOGL 3.875% due 2028', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '3.875%', maturity: 'Nov 2028' },
    { name: 'GOOGL 4.0% due 2030', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '4.000%', maturity: 'May 2030' },
    { name: 'GOOGL 1.1% Note due 2030', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '1.100%', maturity: 'Aug 2030' },
    { name: 'GOOGL 4.1% due 2030', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '4.100%', maturity: 'Nov 2030' },
    { name: 'GOOGL 4.375% due 2032', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '4.375%', maturity: 'Nov 2032' },
    { name: 'GOOGL 4.5% due 2035', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '4.500%', maturity: 'May 2035' },
    { name: 'GOOGL 4.7% due 2035', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '4.700%', maturity: 'Nov 2035' },
    { name: 'GOOGL 1.9% Note due 2040', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '1.900%', maturity: 'Aug 2040' },
    { name: 'GOOGL 5.35% due 2045', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '5.350%', maturity: 'Nov 2045' },
    { name: 'GOOGL 2.05% Notes due 2050', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '2.050%', maturity: 'Aug 2050' },
    { name: 'GOOGL 5.25% due 2055', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '5.250%', maturity: 'May 2055' },
    { name: 'GOOGL 5.45% due 2055', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '5.450%', maturity: 'Nov 2055' },
    { name: 'GOOGL 2.25% Note due 2060', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '2.250%', maturity: 'Aug 2060' },
    { name: 'GOOGL 5.3% due 2065', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '5.300%', maturity: 'May 2065' },
    { name: 'GOOGL 5.7% due 2075', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '5.700%', maturity: 'Nov 2075' },
    { name: 'Commercial Paper Program', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '--', maturity: '--' },
    { name: '$6.0B Revolving Credit Facility', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '--', maturity: '--' },
    { name: '$4.0B Revolving Credit Facility', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-600', coupon: '--', maturity: '--' },
  ],
};

const BOND_SEARCH_EXAMPLE = {
  id: 'bond-search',
  label: 'Bond Pricing',
  query: 'Find bonds yielding above 7% with TRACE pricing',
  results: [
    { ticker: 'APA', name: 'APA Corp 7.7% 2026', ytm: '7.20%', spread: '+284 bps', price: '$100.24' },
    { ticker: 'IHRT', name: 'iHeartMedia 6.375% 2026', ytm: '8.98%', spread: '+462 bps', price: '$98.75' },
    { ticker: 'HTZ', name: 'Hertz 4.625% 2026', ytm: '10.36%', spread: '+619 bps', price: '$94.67' },
    { ticker: 'DISH', name: 'DISH Network 5.25% Sr Secured 2026', ytm: '8.23%', spread: '+406 bps', price: '$97.19' },
    { ticker: 'IHRT', name: 'iHeartMedia 8.375% 2027', ytm: '13.68%', spread: '+951 bps', price: '$93.00' },
    { ticker: 'AMC', name: 'AMC Entertainment 6.125% 2027', ytm: '14.38%', spread: '+1021 bps', price: '$89.19' },
    { ticker: 'DISH', name: 'DISH Network 11.75% Sr Secured 2027', ytm: '9.57%', spread: '+532 bps', price: '$103.88' },
  ],
};

const COVENANT_EXAMPLE = {
  id: 'covenant-analysis',
  label: 'Covenant Analysis',
  query: 'Compare covenants on DISH 5.25% Secured 2026 vs DISH 7.375% Unsecured 2028',
  bonds: ['DISH 5.25% Sr Secured 2026', 'DISH 7.375% Sr Unsecured 2028'],
  rows: [
    { label: 'Seniority', values: ['Sr Secured', 'Sr Unsecured'], highlights: ['text-emerald-600', 'text-amber-600'] },
    { label: 'Debt Incurrence', values: ['Secured Leverage Test', 'No Restriction'], highlights: ['text-gray-900', 'text-red-500'] },
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
            <img src="/logo-transparent.png" alt="DebtStack" className="h-20 md:h-28 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <SignedOut>
              <a href="/chat" className="text-[#2383e2] hover:text-[#1a6bc4] transition text-sm font-semibold">
                Chat
              </a>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard/chat" className="text-[#2383e2] hover:text-[#1a6bc4] transition text-sm font-semibold">
                Chat
              </a>
            </SignedIn>
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
              <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
            Credit Data
            <br />
            <span className="text-[#2383e2]">Built for Every Workflow</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Debt structures, bond pricing, covenant analysis, and corporate hierarchies. Access via chat, REST API, or agent tooling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignedOut>
              <a
                href="/chat"
                className="bg-[#2383e2] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a6bc4] transition"
              >
                Try the Chat Assistant
              </a>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-gray-900 transition border border-gray-300">
                  Get Started with Free Credits
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard/chat"
                className="bg-[#2383e2] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a6bc4] transition"
              >
                Open Chat Assistant
              </a>
              <a
                href="/dashboard"
                className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-gray-900 transition border border-gray-300"
              >
                Go to Dashboard
              </a>
            </SignedIn>
          </div>
          <p className="mt-4 text-sm text-gray-400">No monthly commitment. Pay only for what you use.</p>
        </div>
      </section>

      {/* Example Queries */}
      <section
        id="example-output"
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="px-6 py-16 border-t border-gray-200/60 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900">
            Query Debt Structures, Bond Pricing, and Covenants
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto text-sm leading-relaxed">
            Search across 250+ corporate issuers and 5,000+ bonds. Pull leverage ratios, seniority, TRACE pricing, and covenant terms through a single API.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 justify-center">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => switchExample(i)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  i === 0 ? 'rounded-l-lg' : i === EXAMPLES.length - 1 ? 'rounded-r-lg' : ''
                } ${
                  activeExample === i
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 hover:text-gray-900'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Query + Output Card */}
          <div className="bg-[#D5D8DF] rounded-lg p-5 md:p-6 border border-gray-300/50">
            {/* Query input */}
            <div className="flex items-center gap-3 mb-5 bg-white rounded-lg px-4 py-2.5 border border-gray-200">
              <span className="text-gray-400 text-sm shrink-0">&gt;</span>
              <span className="text-sm text-gray-900 font-mono">
                {typedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-[#2383e2] ml-0.5 animate-pulse align-middle" />}
              </span>
            </div>

            {/* Output */}
            <div className={`transition-all duration-500 ${showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              {activeExample === 0 && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
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
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-gray-500">{BOND_SEARCH_EXAMPLE.results.length} bonds found</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">Min YTM: 7%</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">TRACE Priced</span>
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
                <div className="bg-white rounded-lg p-5 border border-gray-200">
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

      {/* Use Cases */}
      <section
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="px-6 py-16 border-t border-gray-200/60 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Credit Analysts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Screen 250+ issuers by leverage, seniority, and maturity. Pull debt structures and covenants for any name in the universe.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Agent Builders</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Structured credit data for LLM workflows. Tool-use ready with LangChain, MCP, and LlamaIndex integrations.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quant Researchers</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Programmatic access to 5,000+ bonds with pricing, spreads, and corporate structure data via REST API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="get-started"
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="px-6 py-16 border-t border-gray-200/60 opacity-0"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Start querying credit data today
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            No monthly commitment. Pay only for what you use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="/pricing"
              className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-gray-900 transition border border-gray-300"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-16 w-auto invert" />
            </a>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="/pricing" className="hover:text-gray-900 transition">Pricing</a>
              <a href="/blog" className="hover:text-gray-900 transition">Blog</a>
              <a href="https://docs.debtstack.ai" className="hover:text-gray-900 transition">Docs</a>
              <a href="mailto:hello@debtstack.ai" className="hover:text-gray-900 transition">Contact</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            &copy; 2026 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
