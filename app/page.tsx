// app/page.tsx

import LiveDemo from '@/components/LiveDemo';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="px-6 py-32 md:py-48">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Credit Data
            <br />
            <span className="text-blue-500">for AI Agents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Structured corporate debt data, optimized for LLMs and AI workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-500 transition"
            >
              Get Early Access
            </a>
            <a
              href="https://docs.debtstack.ai"
              className="border border-gray-700 text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-500 hover:text-white transition"
            >
              View Docs
            </a>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <LiveDemo />

      {/* Integrations Section */}
      <section className="px-6 py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 mb-12 text-sm uppercase tracking-wider">Works with your stack</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-4xl mb-3">🦜</div>
              <p className="text-gray-400">LangChain</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-gray-400">MCP</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🦙</div>
              <p className="text-gray-400">LlamaIndex</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-gray-400">REST API</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="px-6 py-24 border-t border-gray-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get Early Access
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Join the waitlist. Launching soon with a free tier.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-500 transition whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xl font-bold">DebtStack</div>
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
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
            © 2025 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
