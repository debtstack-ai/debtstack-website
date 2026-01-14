// app/page.tsx
'use client';

import LiveDemo from '@/components/LiveDemo';
import { useEffect, useRef } from 'react';

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

      {/* Hero Section */}
      <section className="relative px-6 py-32 md:py-48">
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
            Structured corporate debt data, optimized for LLMs and AI workflows.
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
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🦜</div>
              <p className="text-gray-400 group-hover:text-white transition-colors">LangChain</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
              <p className="text-gray-400 group-hover:text-white transition-colors">MCP</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🦙</div>
              <p className="text-gray-400 group-hover:text-white transition-colors">LlamaIndex</p>
            </div>
            <div className="group text-center p-8 rounded-2xl glass-card transition-all duration-300 cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <p className="text-gray-400 group-hover:text-white transition-colors">REST API</p>
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition backdrop-blur-sm"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-500 transition whitespace-nowrap glow-button"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">DebtStack</div>
            <div className="flex gap-8 text-gray-400">
              <a
                href="https://docs.debtstack.ai"
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
            © 2025 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
