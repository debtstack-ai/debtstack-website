// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from 'framer-motion';

const DEBT_STRUCTURE_EXAMPLE = {
  id: 'debt-structure',
  label: 'Debt Structure',
  query: "What's AT&T's debt stack?",
  header: { name: 'AT&T Inc. (T)', sector: 'Telecommunications', leverage: '3.06x Leverage' },
  bonds: [
    { name: 'T 7.125% due 2026', seniority: 'Sr Unsecured', coupon: '7.125%', maturity: 'Mar 2026', ytm: '6.56%', price: '$100.27' },
    { name: 'T 2.95% due 2026', seniority: 'Sr Unsecured', coupon: '2.950%', maturity: 'Jul 2026', ytm: '3.70%', price: '$99.63' },
    { name: 'T 3.8% due 2027', seniority: 'Sr Unsecured', coupon: '3.800%', maturity: 'Feb 2027', ytm: '3.81%', price: '$99.98' },
    { name: 'T 4.25% due 2027', seniority: 'Sr Unsecured', coupon: '4.250%', maturity: 'Mar 2027', ytm: '4.01%', price: '$100.34' },
    { name: 'T 6.55% due 2028', seniority: 'Sr Unsecured', coupon: '6.550%', maturity: 'Jan 2028', ytm: '4.23%', price: '$104.39' },
    { name: 'T 4.1% due 2028', seniority: 'Sr Unsecured', coupon: '4.100%', maturity: 'Feb 2028', ytm: '3.95%', price: '$100.32' },
    { name: 'T 6.375% due 2028', seniority: 'Sr Unsecured', coupon: '6.375%', maturity: 'Jun 2028', ytm: '4.11%', price: '$105.32' },
    { name: 'T 4.35% due 2029', seniority: 'Sr Unsecured', coupon: '4.350%', maturity: 'Mar 2029', ytm: '4.04%', price: '$100.95' },
    { name: 'T 7.875% due 2030', seniority: 'Sr Unsecured', coupon: '7.875%', maturity: 'Feb 2030', ytm: '4.69%', price: '$112.73' },
    { name: 'T 4.3% due 2030', seniority: 'Sr Unsecured', coupon: '4.300%', maturity: 'Feb 2030', ytm: '4.21%', price: '$100.34' },
    { name: 'T 8.75% due 2031', seniority: 'Sr Unsecured', coupon: '8.750%', maturity: 'Mar 2031', ytm: '4.77%', price: '$119.03' },
    { name: 'T 6.55% due 2034', seniority: 'Sr Unsecured', coupon: '6.550%', maturity: 'Jun 2034', ytm: '5.15%', price: '$109.53' },
    { name: 'T 4.5% due 2035', seniority: 'Sr Unsecured', coupon: '4.500%', maturity: 'May 2035', ytm: '5.02%', price: '$96.08' },
    { name: 'T 6.8% due 2036', seniority: 'Sr Unsecured', coupon: '6.800%', maturity: 'May 2036', ytm: '5.36%', price: '$111.41' },
    { name: 'T 5.25% due 2037', seniority: 'Sr Unsecured', coupon: '5.250%', maturity: 'Mar 2037', ytm: '5.14%', price: '$100.94' },
    { name: 'T 6.3% due 2038', seniority: 'Sr Unsecured', coupon: '6.300%', maturity: 'Jan 2038', ytm: '5.35%', price: '$108.30' },
    { name: 'T 6.55% due 2039', seniority: 'Sr Unsecured', coupon: '6.550%', maturity: 'Feb 2039', ytm: '5.52%', price: '$109.69' },
    { name: 'T 6.375% due 2041', seniority: 'Sr Unsecured', coupon: '6.375%', maturity: 'Mar 2041', ytm: '5.63%', price: '$107.53' },
    { name: 'Revolving Credit Agreement', seniority: 'Sr Unsecured', coupon: '--', maturity: 'Nov 2030', ytm: '--', price: '--' },
    { name: '364-Day Term Loan', seniority: 'Sr Unsecured', coupon: '--', maturity: 'Nov 2026', ytm: '--', price: '--' },
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
    { label: 'Seniority', values: ['Sr Secured', 'Sr Unsecured'] },
    { label: 'Debt Incurrence', values: ['Secured Leverage Test', 'No Restriction'] },
    { label: 'Restricted Payments', values: ['Builder Basket + 50% CNI', 'Unlimited above 2.0x Coverage'] },
    { label: 'Change of Control', values: ['101% Put', '101% Put'] },
    { label: 'Asset Sale Proceeds', values: ['75% Cash Consideration', 'No Requirement'] },
    { label: 'Guarantees', values: ['Subsidiary Guarantee', 'None'] },
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

// Framer motion variants
const ease = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Home() {
  const [activeExample, setActiveExample] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [demoInView, setDemoInView] = useState(false);
  const hasAnimatedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Provenance section state
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

  // Trigger demo animation when it scrolls into view
  useEffect(() => {
    if (demoInView && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      animateQuery(0);
    }
  }, [demoInView, animateQuery]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (provTimeoutRef.current) clearTimeout(provTimeoutRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#EAECF0] text-black overflow-hidden">
      {/* Header */}
      <motion.header
        className="px-6 py-4 border-b border-gray-200 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <SignedOut>
              <a href="/chat" className="text-[#2383e2] hover:text-[#1a6bc4] transition text-sm font-semibold">
                Ask Medici
              </a>
            </SignedOut>
            <SignedIn>
              <a href="/dashboard/chat" className="text-[#2383e2] hover:text-[#1a6bc4] transition text-sm font-semibold">
                Ask Medici
              </a>
            </SignedIn>
            <a href="https://docs.debtstack.ai" className="text-gray-500 hover:text-black transition text-sm font-medium">
              API
            </a>
            <a href="/pricing" className="text-gray-500 hover:text-black transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-gray-500 hover:text-black transition text-sm font-medium">
              Blog
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-500 hover:text-black transition text-sm font-medium">
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
              <a href="/dashboard" className="text-gray-500 hover:text-black transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="px-6 pt-8 pb-16 md:pt-12 md:pb-20 relative">
        {/* Background effects */}
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="hero-glow" />
        <div className="hero-glow-secondary" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-black"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Credit Data
            <br />
            <span className="text-[#2383e2]">Built for Every Workflow</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            Debt structures, bond pricing, covenant analysis, and corporate hierarchies. Access via chat, REST API, or agent tooling.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <SignedOut>
              <a
                href="/chat"
                className="bg-[#2383e2] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a6bc4] transition hover:shadow-lg hover:shadow-[#2383e2]/20"
              >
                Ask Medici
              </a>
              <a
                href="https://docs.debtstack.ai"
                className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-black transition border border-gray-300 hover:border-gray-400"
              >
                Explore the API
              </a>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard/chat"
                className="bg-[#2383e2] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a6bc4] transition hover:shadow-lg hover:shadow-[#2383e2]/20"
              >
                Ask Medici
              </a>
              <a
                href="https://docs.debtstack.ai"
                className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-black transition border border-gray-300 hover:border-gray-400"
              >
                Explore the API
              </a>
            </SignedIn>
          </motion.div>
          <motion.p
            className="mt-4 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            No monthly commitment. Pay only for what you use.
          </motion.p>
        </div>
      </section>

      {/* Trusted By */}
      <motion.section
        className="px-6 py-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-6">
            Trusted by developers and analysts at
          </p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {TRUSTED_BY.map((company) => (
              <motion.img
                key={company.name}
                src={company.logo}
                alt={company.name}
                className="h-7 opacity-40 hover:opacity-70 transition grayscale hover:grayscale-0"
                variants={staggerItem}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Example Queries */}
      <motion.section
        className="px-6 pt-16 pb-6 border-t border-gray-200/60"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeInUp}
        onViewportEnter={() => setDemoInView(true)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1px_1fr] gap-0 md:gap-10 items-center">
            {/* Left panel */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                Comprehensive
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                250+ corporate issuers, 5,000+ bonds. Debt structures, leverage ratios, TRACE pricing, and covenant terms through a single API.
              </p>

              {/* Tabs */}
              <div className="flex flex-row md:flex-col gap-1">
                {EXAMPLES.map((ex, i) => (
                  <motion.button
                    key={ex.id}
                    onClick={() => switchExample(i)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-left ${
                      activeExample === i
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-black'
                    }`}
                    whileHover={{ x: activeExample === i ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {ex.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch" />

            {/* Right panel — Terminal Card */}
            <div className="mt-6 md:mt-0 terminal-card p-5 md:p-6 md:h-[420px] overflow-hidden" style={{ fontFamily: 'var(--font-jetbrains), monospace', background: '#DFE1E6' }}>
              {/* Query input */}
              <div className="flex items-center gap-3 mb-5 px-4 py-2.5 bg-[#D4D7DD] rounded-lg border border-[#C0C4CC]">
                <span className="text-black text-xs shrink-0">$</span>
                <span className="text-xs text-black">
                  {typedText}
                  {isTyping && <span className="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              {/* Output */}
              <AnimatePresence mode="wait">
                {showOutput && (
                  <motion.div
                    key={activeExample}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {activeExample === 0 && (
                      <div className="rounded-lg p-5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs">
                          <span className="font-semibold text-black">{DEBT_STRUCTURE_EXAMPLE.header.name}</span>
                          <span className="text-black">|</span>
                          <span className="text-black">{DEBT_STRUCTURE_EXAMPLE.header.sector}</span>
                          <span className="text-black">|</span>
                          <span className="text-black font-semibold">{DEBT_STRUCTURE_EXAMPLE.header.leverage}</span>
                        </div>
                        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-[#DFE1E6]">
                              <tr className="text-black border-b border-[#C0C4CC]">
                                <th className="pb-2 pr-4 font-medium">Bond</th>
                                <th className="pb-2 pr-4 font-medium">Coupon</th>
                                <th className="pb-2 pr-4 font-medium">Maturity</th>
                                <th className="pb-2 pr-4 font-medium">YTM</th>
                                <th className="pb-2 font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody className="text-black">
                              {DEBT_STRUCTURE_EXAMPLE.bonds.map((bond, i) => (
                                <motion.tr
                                  key={i}
                                  className={i < DEBT_STRUCTURE_EXAMPLE.bonds.length - 1 ? 'border-b border-[#C8CCD4]/50' : ''}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.03, duration: 0.3 }}
                                >
                                  <td className="py-2 pr-4 font-medium text-black">{bond.name}</td>
                                  <td className="py-2 pr-4">{bond.coupon}</td>
                                  <td className="py-2 pr-4">{bond.maturity}</td>
                                  <td className="py-2 pr-4">{bond.ytm}</td>
                                  <td className="py-2">{bond.price}</td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeExample === 1 && (
                      <div className="rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-4 text-xs">
                          <span className="text-black">{BOND_SEARCH_EXAMPLE.results.length} bonds found</span>
                          <span className="text-black">|</span>
                          <span className="text-black">Min YTM: 7%</span>
                          <span className="text-black">|</span>
                          <span className="text-black">TRACE Priced</span>
                        </div>
                        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-[#DFE1E6]">
                              <tr className="text-black border-b border-[#C0C4CC]">
                                <th className="pb-2 pr-4 font-medium">Ticker</th>
                                <th className="pb-2 pr-4 font-medium">Bond</th>
                                <th className="pb-2 pr-4 font-medium">YTM</th>
                                <th className="pb-2 pr-4 font-medium">Spread</th>
                                <th className="pb-2 font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody className="text-black">
                              {BOND_SEARCH_EXAMPLE.results.map((bond, i) => (
                                <motion.tr
                                  key={i}
                                  className={i < BOND_SEARCH_EXAMPLE.results.length - 1 ? 'border-b border-[#C8CCD4]/50' : ''}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.05, duration: 0.3 }}
                                >
                                  <td className="py-2 pr-4 font-semibold text-black">{bond.ticker}</td>
                                  <td className="py-2 pr-4 font-medium text-black">{bond.name}</td>
                                  <td className="py-2 pr-4">{bond.ytm}</td>
                                  <td className="py-2 pr-4 text-black">{bond.spread}</td>
                                  <td className="py-2">{bond.price}</td>
                                </motion.tr>
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
                              <tr className="border-b border-[#C0C4CC]">
                                <th className="pb-3 pr-4 font-medium text-black w-1/4">Covenant</th>
                                <th className="pb-3 pr-4 font-medium text-black w-[37.5%]">{COVENANT_EXAMPLE.bonds[0]}</th>
                                <th className="pb-3 font-medium text-black w-[37.5%]">{COVENANT_EXAMPLE.bonds[1]}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {COVENANT_EXAMPLE.rows.map((row, i) => (
                                <motion.tr
                                  key={i}
                                  className={i < COVENANT_EXAMPLE.rows.length - 1 ? 'border-b border-[#C8CCD4]/50' : ''}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.06, duration: 0.3 }}
                                >
                                  <td className="py-2 pr-4 text-black font-medium">{row.label}</td>
                                  <td className="py-2 pr-4 text-black">{row.values[0]}</td>
                                  <td className="py-2 text-black">{row.values[1]}</td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Provenance Demo — Step 1: Leverage Comparison */}
      <motion.section
        className="px-6 py-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeInUp}
        onViewportEnter={() => {
          if (!hasAnimatedProvRef.current) {
            hasAnimatedProvRef.current = true;
            animateProvenance();
          }
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_280px] gap-0 md:gap-10 items-center">
            {/* Left panel — Step 1 card */}
            <div className="order-2 md:order-none mt-6 md:mt-0 terminal-card p-5 md:p-6 md:h-[420px] overflow-hidden" style={{ fontFamily: 'var(--font-jetbrains), monospace', background: '#DFE1E6' }}>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#D4D7DD] rounded-lg border border-[#C0C4CC]">
                <span className="text-black text-xs shrink-0">$</span>
                <span className="text-xs text-black">
                  {provStep >= 3 ? PROVENANCE_DATA.query1 : provStep >= 1 ? provTyped : ''}
                  {provStep === 1 && provIsTyping && <span className="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              <AnimatePresence>
                {provStep >= 2 && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                      {PROVENANCE_DATA.companies.map((co, ci) => (
                        <motion.div
                          key={ci}
                          className={`${ci === 0 ? 'md:border-r md:border-[#C0C4CC] md:pr-4' : 'md:pl-4'}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ci * 0.15, duration: 0.4 }}
                        >
                          <div className="flex items-center gap-x-2 mb-2 text-xs">
                            <span className="font-semibold text-black">{co.name}</span>
                            <span className="text-black">({co.ticker})</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-black font-semibold text-xs">{co.leverage}</span>
                            <span className="text-black text-xs">Net Leverage</span>
                          </div>
                          <div className="space-y-1 mb-2">
                            {co.metrics.map((m, i) => (
                              <div key={i} className="flex items-center gap-x-2 text-xs whitespace-nowrap">
                                <span className="text-black">{m.label}</span>
                                <span className="text-black font-semibold">{m.value}</span>
                                <span className="text-black">&rarr;</span>
                                <span className="text-black">{m.source}</span>
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
                          <p className="text-xs text-black">{co.ebitdaNote}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch order-none" />

            {/* Right panel */}
            <div className="order-1 md:order-none">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                Verifiable
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every metric comes with backup calculations you can verify.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Provenance Demo — Step 2: Debt Stack */}
      <section className="px-6 pt-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1px_1fr] gap-0 md:gap-10 items-center">
            {/* Left panel */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInUp}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                Traceable
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every debt instrument links to its governing indenture, credit agreement, or prospectus on SEC EDGAR.
              </p>
            </motion.div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch" />

            {/* Right panel — Step 2 card */}
            <motion.div
              className={`mt-6 md:mt-0 terminal-card p-5 md:p-6 md:h-[420px] overflow-hidden ${provStep >= 3 ? '' : 'opacity-0 translate-y-2'}`}
              style={{ fontFamily: 'var(--font-jetbrains), monospace', background: '#DFE1E6' }}
              animate={provStep >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#D4D7DD] rounded-lg border border-[#C0C4CC]">
                <span className="text-black text-xs shrink-0">$</span>
                <span className="text-xs text-black">
                  {provStep === 3 ? provTyped : provStep >= 4 ? PROVENANCE_DATA.query2 : ''}
                  {provStep === 3 && provIsTyping && <span className="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse align-middle" />}
                </span>
              </div>

              <AnimatePresence>
                {provStep >= 4 && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs">
                        <span className="font-semibold text-black">{PROVENANCE_DATA.debtStack.company}</span>
                        <span className="text-black">&middot;</span>
                        <span className="text-black">Total Debt: {PROVENANCE_DATA.debtStack.totalDebt}</span>
                        <span className="text-black">&middot;</span>
                        <span className="text-black">{PROVENANCE_DATA.debtStack.instruments.length} instruments shown</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-black border-b border-[#C0C4CC]">
                              <th className="pb-2 pr-4 font-medium">Instrument</th>
                              <th className="pb-2 pr-4 font-medium">Amount</th>
                              <th className="pb-2 pr-4 font-medium">Seniority</th>
                              <th className="pb-2 font-medium">Source Filing</th>
                            </tr>
                          </thead>
                          <tbody className="text-black">
                            {PROVENANCE_DATA.debtStack.instruments.map((inst, i) => (
                              <motion.tr
                                key={i}
                                className={i < PROVENANCE_DATA.debtStack.instruments.length - 1 ? 'border-b border-[#C8CCD4]/50' : ''}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                              >
                                <td className="py-2 pr-4 font-medium text-black">{inst.name}</td>
                                <td className="py-2 pr-4 font-semibold">{inst.amount}</td>
                                <td className="py-2 pr-4 text-black">{inst.seniority}</td>
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
                                    <span className="bg-[#C8CCD4] text-black text-xs px-1.5 py-0.5 rounded">{inst.confidence}</span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <motion.section
        className="px-6 py-16 border-t border-gray-200/60"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Credit Analysts',
                desc: 'Screen 250+ issuers by leverage, seniority, and maturity. Pull debt structures and covenants for any name in the universe.',
              },
              {
                title: 'AI Agent Builders',
                desc: 'Structured credit data for LLM workflows. Tool-use ready with LangChain, MCP, and LlamaIndex integrations.',
              },
              {
                title: 'Quant Researchers',
                desc: 'Programmatic access to 5,000+ bonds with pricing, spreads, and corporate structure data via REST API.',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                className="feature-card p-6 rounded-lg border border-gray-200/60 bg-white/40 backdrop-blur-sm"
                variants={staggerItem}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-semibold text-black mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        id="get-started"
        className="px-6 py-16 border-t border-gray-200/60"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={fadeInUp}
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
            Start querying credit data today
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            No monthly commitment. Pay only for what you use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition hover:shadow-lg">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition hover:shadow-lg"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="/pricing"
              className="text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:text-black transition border border-gray-300 hover:border-gray-400"
            >
              View Pricing
            </a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-16 w-auto invert" />
            </a>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="/pricing" className="hover:text-black transition">Pricing</a>
              <a href="/blog" className="hover:text-black transition">Blog</a>
              <a href="https://docs.debtstack.ai" className="hover:text-black transition">Docs</a>
              <a href="mailto:debtstackai@gmail.com" className="hover:text-black transition">Contact</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <span>&copy; 2026 DebtStack</span>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-black transition">Privacy Policy</a>
              <a href="/terms" className="hover:text-black transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
