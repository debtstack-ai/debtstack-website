// app/page.tsx
'use client';

import LiveDemo from '@/components/LiveDemo';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('You\'re on the list!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect. Please try again.');
    }
  };

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
            <a href="#waitlist" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition">
              Get Access
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full glass-card text-sm text-blue-400 border border-blue-500/30">
            Now in Private Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Credit Data
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">for AI Agents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Structured corporate debt data and pricing, optimized for LLMs and AI workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition glow-button"
            >
              Get Early Access
            </a>
            <a
              href="https://docs.debtstack.ai"
              className="text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:text-white transition glass-card"
            >
              View Docs
            </a>
          </div>
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
        id="waitlist"
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="relative px-6 py-32 border-t border-gray-800/30 opacity-0"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Get Early Access
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Join the waitlist. Launching soon with a free tier.
          </p>
          {status === 'success' ? (
            <div className="max-w-md mx-auto p-6 rounded-xl glass-card border border-green-500/30">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 font-semibold">{message}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition backdrop-blur-sm"
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-500 transition whitespace-nowrap glow-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm mt-4">{message}</p>
          )}
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
                href="mailto:hello@debtstack.ai"
                className="hover:text-white transition"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-600">
            © 2025 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
