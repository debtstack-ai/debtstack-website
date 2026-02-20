// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const DEBT_STRUCTURE_EXAMPLE = {
  id: 'debt-structure',
  label: 'Debt Structure',
  query: "What's AT&T's debt stack?",
  header: { name: 'AT&T Inc. (T)', sector: 'Telecommunications', leverage: '3.06x Leverage' },
  bonds: [
    { name: 'T 7.125% due 2026', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '7.125%', maturity: 'Mar 2026', ytm: '6.56%', price: '$100.27' },
    { name: 'T 2.95% due 2026', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '2.950%', maturity: 'Jul 2026', ytm: '3.70%', price: '$99.63' },
    { name: 'T 3.8% due 2027', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '3.800%', maturity: 'Feb 2027', ytm: '3.81%', price: '$99.98' },
    { name: 'T 4.25% due 2027', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '4.250%', maturity: 'Mar 2027', ytm: '4.01%', price: '$100.34' },
    { name: 'T 6.55% due 2028', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.550%', maturity: 'Jan 2028', ytm: '4.23%', price: '$104.39' },
    { name: 'T 4.1% due 2028', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '4.100%', maturity: 'Feb 2028', ytm: '3.95%', price: '$100.32' },
    { name: 'T 6.375% due 2028', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.375%', maturity: 'Jun 2028', ytm: '4.11%', price: '$105.32' },
    { name: 'T 4.35% due 2029', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '4.350%', maturity: 'Mar 2029', ytm: '4.04%', price: '$100.95' },
    { name: 'T 7.875% due 2030', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '7.875%', maturity: 'Feb 2030', ytm: '4.69%', price: '$112.73' },
    { name: 'T 4.3% due 2030', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '4.300%', maturity: 'Feb 2030', ytm: '4.21%', price: '$100.34' },
    { name: 'T 8.75% due 2031', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '8.750%', maturity: 'Mar 2031', ytm: '4.77%', price: '$119.03' },
    { name: 'T 6.55% due 2034', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.550%', maturity: 'Jun 2034', ytm: '5.15%', price: '$109.53' },
    { name: 'T 4.5% due 2035', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '4.500%', maturity: 'May 2035', ytm: '5.02%', price: '$96.08' },
    { name: 'T 6.8% due 2036', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.800%', maturity: 'May 2036', ytm: '5.36%', price: '$111.41' },
    { name: 'T 5.25% due 2037', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '5.250%', maturity: 'Mar 2037', ytm: '5.14%', price: '$100.94' },
    { name: 'T 6.3% due 2038', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.300%', maturity: 'Jan 2038', ytm: '5.35%', price: '$108.30' },
    { name: 'T 6.55% due 2039', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.550%', maturity: 'Feb 2039', ytm: '5.52%', price: '$109.69' },
    { name: 'T 6.375% due 2041', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '6.375%', maturity: 'Mar 2041', ytm: '5.63%', price: '$107.53' },
    { name: 'Revolving Credit Agreement', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '--', maturity: 'Nov 2030', ytm: '--', price: '--' },
    { name: '364-Day Term Loan', seniority: 'Sr Unsecured', seniorityColor: 'text-emerald-400', coupon: '--', maturity: 'Nov 2026', ytm: '--', price: '--' },
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
    { label: 'Seniority', values: ['Sr Secured', 'Sr Unsecured'], highlights: ['text-emerald-400', 'text-amber-400'] },
    { label: 'Debt Incurrence', values: ['Secured Leverage Test', 'No Restriction'], highlights: ['text-gray-300', 'text-red-400'] },
    { label: 'Restricted Payments', values: ['Builder Basket + 50% CNI', 'Unlimited above 2.0x Coverage'], highlights: ['text-gray-300', 'text-gray-300'] },
    { label: 'Change of Control', values: ['101% Put', '101% Put'], highlights: ['text-gray-300', 'text-gray-300'] },
    { label: 'Asset Sale Proceeds', values: ['75% Cash Consideration', 'No Requirement'], highlights: ['text-gray-300', 'text-red-400'] },
    { label: 'Guarantees', values: ['Subsidiary Guarantee', 'None'], highlights: ['text-emerald-400', 'text-red-400'] },
  ],
};

const PROVENANCE_DATA = {
  query1: 'Compare leverage ratios for CHTR and ATUS',
  query2: "Show me CHTR's debt stack with sources",
  companies: [
    {
      name: 'Charter Communications',
      ticker: 'CHTR',
      sector: 'Telecom',
      leverage: '4.31x',
      metrics: [
        { label: 'Total Debt', value: '$94.0B', source: '10-K (Dec 2025)', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000109166726000017/chtr-20251231.htm' },
        { label: 'TTM EBITDA', value: '$21.8B', source: '10-K (Dec 2025)', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000109166726000017/chtr-20251231.htm' },
      ],
      ebitdaNote: 'Full year \u00b7 4 quarters \u00b7 Not annualized',
    },
    {
      name: 'Altice USA',
      ticker: 'ATUS',
      sector: 'Telecom',
      leverage: '5.84x',
      metrics: [
        { label: 'Total Debt', value: '$24.9B', source: '10-K (Dec 2025)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001702780&type=10-K' },
        { label: 'TTM EBITDA', value: '$4.3B', source: '10-K (Dec 2025)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001702780&type=10-K' },
      ],
      ebitdaNote: 'Full year \u00b7 4 quarters \u00b7 Not annualized',
    },
  ],
  debtStack: {
    company: 'Charter Communications (CHTR)',
    totalDebt: '$94.0B',
    instruments: [
      { name: 'Term B-5 Loan', amount: '$25.0B', seniority: 'Sr Secured', docType: 'Credit Agreement (8-K)', confidence: '95%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000110465924126817/tm2430518d1_ex10-1.htm' },
      { name: 'Term A-7 Loan', amount: '$45.0B', seniority: 'Sr Secured', docType: 'Credit Agreement (8-K)', confidence: '95%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000110465924126817/tm2430518d1_ex10-1.htm' },
      { name: '5.850% Sr Secured 2035', amount: '$12.5B', seniority: 'Sr Secured', docType: 'Suppl. Indenture (8-K)', confidence: '80%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000110465925086395/tm2524701d1_ex4-2.htm' },
      { name: '6.700% Sr Secured 2055', amount: '$7.5B', seniority: 'Sr Secured', docType: 'Suppl. Indenture (8-K)', confidence: '80%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000110465925086395/tm2524701d1_ex4-2.htm' },
      { name: '6.15% Sr Unsecured 2026', amount: '$1.5B', seniority: 'Sr Unsecured', docType: 'Suppl. Indenture (8-K)', confidence: '55%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000110465926003739/tm263008d1_ex4-2.htm' },
      { name: 'EIP Financing Facility', amount: '$2.0B', seniority: 'Sr Secured', docType: 'Credit Agreement (8-K)', confidence: '70%', url: 'https://www.sec.gov/Archives/edgar/data/1091667/000114036124046322/ny20038391x1_ex10-1.htm' },
    ],
  },
};

const EXAMPLES = [DEBT_STRUCTURE_EXAMPLE, BOND_SEARCH_EXAMPLE, COVENANT_EXAMPLE];

const TRUSTED_BY = [
  { name: 'Google', logo: '/logos/google.svg' },
  { name: 'MIT', logo: '/logos/mit.svg' },
  { name: 'LangChain', logo: '/logos/langchain.svg' },
  { name: 'Anthropic', logo: '/logos/anthropic.svg' },
];

export default function Home() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeExample, setActiveExample] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const hasAnimatedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Provenance section state: 0=idle, 1=typing-q1, 2=result1, 3=typing-q2, 4=result2
  const [provStep, setProvStep] = useState(0);
  const [provTyped, setProvTyped] = useState('');
  const [provIsTyping, setProvIsTyping] = useState(false);
  const hasAnimatedProvRef = useRef(false);
  const provTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const animateProvenance = useCallback(() => {
    setProvStep(1);
    setProvTyped('');
    setProvIsTyping(true);

    const q1 = PROVENANCE_DATA.query1;
    let i = 0;
    const typeQ1 = () => {
      if (i < q1.length) {
        setProvTyped(q1.slice(0, i + 1));
        i++;
        provTimeoutRef.current = setTimeout(typeQ1, 30);
      } else {
        setProvIsTyping(false);
        provTimeoutRef.current = setTimeout(() => {
          setProvStep(2);
          // After showing result 1, pause then type query 2
          provTimeoutRef.current = setTimeout(() => {
            setProvStep(3);
            setProvTyped('');
            setProvIsTyping(true);
            const q2 = PROVENANCE_DATA.query2;
            let j = 0;
            const typeQ2 = () => {
              if (j < q2.length) {
                setProvTyped(q2.slice(0, j + 1));
                j++;
                provTimeoutRef.current = setTimeout(typeQ2, 30);
              } else {
                setProvIsTyping(false);
                provTimeoutRef.current = setTimeout(() => {
                  setProvStep(4);
                }, 400);
              }
            };
            provTimeoutRef.current = setTimeout(typeQ2, 200);
          }, 1000);
        }, 400);
      }
    };
    provTimeoutRef.current = setTimeout(typeQ1, 200);
  }, []);

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
            if (entry.target.id === 'provenance-section' && !hasAnimatedProvRef.current) {
              hasAnimatedProvRef.current = true;
              animateProvenance();
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
      if (provTimeoutRef.current) clearTimeout(provTimeoutRef.current);
    };
  }, [animateQuery, animateProvenance]);

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
            <a href="https://docs.debtstack.ai" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              API
            </a>
            <a href="/pricing" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Blog
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
              <a
                href="https://docs.debtstack.ai"
                className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-gray-900 transition border border-gray-300"
              >
                Explore the API
              </a>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard/chat"
                className="bg-[#2383e2] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a6bc4] transition"
              >
                Open Chat Assistant
              </a>
              <a
                href="https://docs.debtstack.ai"
                className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-gray-900 transition border border-gray-300"
              >
                Explore the API
              </a>
            </SignedIn>
          </div>
          <p className="mt-4 text-sm text-gray-400">No monthly commitment. Pay only for what you use.</p>
        </div>
      </section>

      {/* Trusted By */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-6">
            Trusted by developers and analysts at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUSTED_BY.map((company) => (
              <img
                key={company.name}
                src={company.logo}
                alt={company.name}
                className="h-7 opacity-40 hover:opacity-70 transition grayscale hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Example Queries */}
      <section
        id="example-output"
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="px-6 pt-16 pb-6 border-t border-gray-200/60 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1px_1fr] gap-0 md:gap-10 items-center">
            {/* Left panel */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                Comprehensive
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                250+ corporate issuers, 5,000+ bonds. Debt structures, leverage ratios, TRACE pricing, and covenant terms through a single API.
              </p>

              {/* Tabs — vertical on left */}
              <div className="flex flex-row md:flex-col gap-1">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.id}
                    onClick={() => switchExample(i)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-left ${
                      activeExample === i
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch" />

            {/* Right panel — Query + Output Card */}
            <div className="mt-6 md:mt-0 bg-gray-900 rounded-lg p-5 md:p-6 border border-gray-700/50 md:h-[420px] overflow-hidden" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
              {/* Query input */}
              <div className="flex items-center gap-3 mb-5 px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-emerald-400 text-xs shrink-0">$</span>
                <span className="text-xs text-gray-100">
                  {typedText}
                  {isTyping && <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              {/* Output */}
              <div className={`transition-all duration-500 ${showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                {activeExample === 0 && (
                  <div className="rounded-lg p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs">
                      <span className="font-semibold text-gray-100">{DEBT_STRUCTURE_EXAMPLE.header.name}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-400">{DEBT_STRUCTURE_EXAMPLE.header.sector}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-emerald-400 font-semibold">{DEBT_STRUCTURE_EXAMPLE.header.leverage}</span>
                    </div>
                    <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-gray-900">
                          <tr className="text-gray-500 border-b border-gray-700/50">
                            <th className="pb-2 pr-4 font-medium">Bond</th>
                            <th className="pb-2 pr-4 font-medium">Coupon</th>
                            <th className="pb-2 pr-4 font-medium">Maturity</th>
                            <th className="pb-2 pr-4 font-medium">YTM</th>
                            <th className="pb-2 font-medium">Price</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          {DEBT_STRUCTURE_EXAMPLE.bonds.map((bond, i) => (
                            <tr key={i} className={i < DEBT_STRUCTURE_EXAMPLE.bonds.length - 1 ? 'border-b border-gray-800' : ''}>
                              <td className="py-2 pr-4 font-medium text-gray-100">{bond.name}</td>
                              <td className="py-2 pr-4">{bond.coupon}</td>
                              <td className="py-2 pr-4">{bond.maturity}</td>
                              <td className="py-2 pr-4">{bond.ytm}</td>
                              <td className="py-2">{bond.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeExample === 1 && (
                  <div className="rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4 text-xs">
                      <span className="text-gray-400">{BOND_SEARCH_EXAMPLE.results.length} bonds found</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-400">Min YTM: 7%</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-400">TRACE Priced</span>
                    </div>
                    <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-gray-900">
                          <tr className="text-gray-500 border-b border-gray-700/50">
                            <th className="pb-2 pr-4 font-medium">Ticker</th>
                            <th className="pb-2 pr-4 font-medium">Bond</th>
                            <th className="pb-2 pr-4 font-medium">YTM</th>
                            <th className="pb-2 pr-4 font-medium">Spread</th>
                            <th className="pb-2 font-medium">Price</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          {BOND_SEARCH_EXAMPLE.results.map((bond, i) => (
                            <tr key={i} className={i < BOND_SEARCH_EXAMPLE.results.length - 1 ? 'border-b border-gray-800' : ''}>
                              <td className="py-2 pr-4 font-semibold text-emerald-400">{bond.ticker}</td>
                              <td className="py-2 pr-4 font-medium text-gray-100">{bond.name}</td>
                              <td className="py-2 pr-4">{bond.ytm}</td>
                              <td className="py-2 pr-4 text-gray-400">{bond.spread}</td>
                              <td className="py-2">{bond.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeExample === 2 && (
                  <div className="rounded-lg p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="pb-3 pr-4 font-medium text-gray-500 w-1/4">Covenant</th>
                            <th className="pb-3 pr-4 font-medium text-gray-100 w-[37.5%]">{COVENANT_EXAMPLE.bonds[0]}</th>
                            <th className="pb-3 font-medium text-gray-100 w-[37.5%]">{COVENANT_EXAMPLE.bonds[1]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {COVENANT_EXAMPLE.rows.map((row, i) => (
                            <tr key={i} className={i < COVENANT_EXAMPLE.rows.length - 1 ? 'border-b border-gray-800' : ''}>
                              <td className="py-2 pr-4 text-gray-500 font-medium">{row.label}</td>
                              <td className={`py-2 pr-4 ${row.highlights[0]}`}>{row.values[0]}</td>
                              <td className={`py-2 ${row.highlights[1]}`}>{row.values[1]}</td>
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
        </div>
      </section>

      {/* Provenance Demo — Step 1: Leverage Comparison */}
      <section
        id="provenance-section"
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="px-6 py-6 opacity-0"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_280px] gap-0 md:gap-10 items-center">
            {/* Left panel — Step 1 card */}
            <div className="order-2 md:order-none mt-6 md:mt-0 bg-gray-900 rounded-lg p-5 md:p-6 border border-gray-700/50 md:h-[420px] overflow-hidden" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-emerald-400 text-xs shrink-0">$</span>
                <span className="text-xs text-gray-100">
                  {provStep >= 3 ? PROVENANCE_DATA.query1 : provStep >= 1 ? provTyped : ''}
                  {provStep === 1 && provIsTyping && <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              <div className={`transition-all duration-500 mt-4 ${provStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                  {PROVENANCE_DATA.companies.map((co, ci) => (
                    <div key={ci} className={`${ci === 0 ? 'md:border-r md:border-gray-700/50 md:pr-4' : 'md:pl-4'}`}>
                      <div className="flex items-center gap-x-2 mb-2 text-xs">
                        <span className="font-semibold text-gray-100">{co.name}</span>
                        <span className="text-gray-500">({co.ticker})</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-emerald-400 font-semibold text-base">{co.leverage}</span>
                        <span className="text-gray-500 text-xs">Net Leverage</span>
                      </div>
                      <div className="space-y-1 mb-2">
                        {co.metrics.map((m, i) => (
                          <div key={i} className="flex items-center gap-x-2 text-xs whitespace-nowrap">
                            <span className="text-gray-400">{m.label}</span>
                            <span className="text-gray-100 font-semibold">{m.value}</span>
                            <span className="text-gray-600">&rarr;</span>
                            <span className="text-gray-400">{m.source}</span>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2383e2] text-xs hover:underline"
                            >
                              SEC ↗
                            </a>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{co.ebitdaNote}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch order-none" />

            {/* Right panel — Text */}
            <div className="order-1 md:order-none">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                Verifiable
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every metric comes with backup calculations and links to the underlying SEC filings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provenance Demo — Step 2: Debt Stack */}
      <section className="px-6 pt-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1px_1fr] gap-0 md:gap-10 items-center">
            {/* Left panel */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                Traceable
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every debt instrument links to its governing indenture, credit agreement, or prospectus on SEC EDGAR.
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch" />

            {/* Right panel — Step 2 card */}
            <div className={`mt-6 md:mt-0 bg-gray-900 rounded-lg p-5 md:p-6 border border-gray-700/50 md:h-[420px] overflow-hidden transition-all duration-500 ${provStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-emerald-400 text-xs shrink-0">$</span>
                <span className="text-xs text-gray-100">
                  {provStep === 3 ? provTyped : provStep >= 4 ? PROVENANCE_DATA.query2 : ''}
                  {provStep === 3 && provIsTyping && <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              <div className={`transition-all duration-500 mt-4 ${provStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <div className="px-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs">
                    <span className="font-semibold text-gray-100">{PROVENANCE_DATA.debtStack.company}</span>
                    <span className="text-gray-600">&middot;</span>
                    <span className="text-gray-400">Total Debt: {PROVENANCE_DATA.debtStack.totalDebt}</span>
                    <span className="text-gray-600">&middot;</span>
                    <span className="text-gray-400">{PROVENANCE_DATA.debtStack.instruments.length} instruments shown</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-700/50">
                          <th className="pb-2 pr-4 font-medium">Instrument</th>
                          <th className="pb-2 pr-4 font-medium">Amount</th>
                          <th className="pb-2 pr-4 font-medium">Seniority</th>
                          <th className="pb-2 font-medium">Source Filing</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {PROVENANCE_DATA.debtStack.instruments.map((inst, i) => (
                          <tr key={i} className={i < PROVENANCE_DATA.debtStack.instruments.length - 1 ? 'border-b border-gray-800' : ''}>
                            <td className="py-2 pr-4 font-medium text-gray-100">{inst.name}</td>
                            <td className="py-2 pr-4 font-semibold">{inst.amount}</td>
                            <td className={`py-2 pr-4 ${inst.seniority === 'Sr Secured' ? 'text-emerald-400' : 'text-amber-400'}`}>{inst.seniority}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <a
                                  href={inst.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#2383e2] hover:underline"
                                >
                                  {inst.docType} ↗
                                </a>
                                <span className="bg-gray-800 text-emerald-400 text-xs px-1.5 py-0.5 rounded">{inst.confidence}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section
        ref={(el) => { sectionsRef.current[2] = el; }}
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
        ref={(el) => { sectionsRef.current[3] = el; }}
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
