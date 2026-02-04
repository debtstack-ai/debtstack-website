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
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="#demo" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Demo
            </a>
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

      {/* Hero Section */}
      <section className="px-6 py-24 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
            Credit Data
            <br />
            <span className="text-[#2383e2]">for AI Agents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Structured corporate debt data and pricing, optimized for LLMs and AI workflows.
          </p>

          {/* Data Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">200+</div>
              <div className="text-gray-400">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2,500+</div>
              <div className="text-gray-400">Debt Instruments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">6,500+</div>
              <div className="text-gray-400">Document Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">5,000+</div>
              <div className="text-gray-400">Guarantees</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition">
                  Start Free
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
              href="https://docs.debtstack.ai"
              className="text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:text-gray-900 transition border border-gray-200 hover:border-gray-300"
            >
              View Docs
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">25 free queries per day. No credit card required.</p>
        </div>
      </section>

      {/* Live Demo Section */}
      <LiveDemo />

      {/* Integrations Section */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="px-6 py-24 border-t border-gray-100 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-400 mb-12 text-sm uppercase tracking-widest">Works with your stack</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 group-hover:text-gray-900 transition-colors font-medium">LangChain</p>
            </div>
            <div className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 group-hover:text-gray-900 transition-colors font-medium">MCP</p>
            </div>
            <div className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 group-hover:text-gray-900 transition-colors font-medium">LlamaIndex</p>
            </div>
            <div className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
                    <circle cx="19" cy="18" r="2"/>
                    <path d="M17 18h-3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 group-hover:text-gray-900 transition-colors font-medium">REST API</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="get-started"
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="px-6 py-32 border-t border-gray-100 opacity-0"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to Build?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Start with 25 free queries per day. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
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
              <a href="#demo" className="hover:text-gray-900 transition">Demo</a>
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
