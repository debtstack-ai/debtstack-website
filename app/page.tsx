// app/page.tsx
'use client';

import LiveDemo from '@/components/LiveDemo';
import { useEffect, useRef } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white animated-gradient-bg overflow-x-hidden">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Header */}
      <header className="relative px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="#demo" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Demo
            </a>
            <a href="/pricing" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Pricing
            </a>
            <a href="https://kuyperiancapitalllc.mintlify.app" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Docs
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

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Credit Data
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">for AI Agents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Structured corporate debt data and pricing, optimized for LLMs and AI workflows.
          </p>

          {/* Data Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">200+</div>
              <div className="text-gray-500">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2,500+</div>
              <div className="text-gray-500">Debt Instruments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">6,500+</div>
              <div className="text-gray-500">Document Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5,000+</div>
              <div className="text-gray-500">Guarantees</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition glow-button">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition glow-button"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="https://docs.debtstack.ai"
              className="text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:text-white transition glass-card"
            >
              View Docs
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">25 free queries per day. No credit card required.</p>
        </div>
      </section>

      {/* Live Demo Section */}
      <LiveDemo />

      {/* Integrations Section */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="relative px-6 py-24 border-t border-gray-800/30 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 mb-12 text-sm uppercase tracking-widest">Works with your stack</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors font-medium">LangChain</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors font-medium">MCP</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors font-medium">LlamaIndex</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
                    <circle cx="19" cy="18" r="2"/>
                    <path d="M17 18h-3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors font-medium">REST API</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="get-started"
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="relative px-6 py-32 border-t border-gray-800/30 opacity-0"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ready to Build?
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Start with 25 free queries per day. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition glow-button">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition glow-button"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="/pricing"
              className="text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:text-white transition glass-card"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-32 w-auto" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a
                href="#demo"
                className="hover:text-white transition"
              >
                Demo
              </a>
              <a
                href="/pricing"
                className="hover:text-white transition"
              >
                Pricing
              </a>
              <a
                href="https://kuyperiancapitalllc.mintlify.app"
                className="hover:text-white transition"
              >
                Docs
              </a>
              <a
                href="mailto:hello@debtstack.ai"
                className="hover:text-white transition"
              >
                Contact
              </a>
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
