// app/page.tsx

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Credit Data Infrastructure
            <br />
            <span className="text-blue-600">for AI Agents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Structured corporate debt data from SEC filings, optimized for LangChain, Claude, and AI agents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#waitlist"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Early Access
            </a>
            <a
              href="https://docs.debtstack.ai"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition"
            >
              View Docs →
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>38 companies</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>779 entities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>330 debt instruments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            The Problem
          </h2>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Extracting accurate debt structures from SEC filings is surprisingly hard:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-red-500 text-2xl mb-3">⚠️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Accuracy Issues</h3>
              <p className="text-gray-600">LLMs return malformed JSON, confuse entity names, aggregate data instead of extracting individual instruments</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-red-500 text-2xl mb-3">⏱️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Slow Extraction</h3>
              <p className="text-gray-600">Takes 90-300 seconds per company with multiple LLM calls, retries, and QA loops</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-red-500 text-2xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Cost Uncertainty</h3>
              <p className="text-gray-600">Ad-hoc extraction costs $0.03-0.50+ per company, compounding with retries</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-red-500 text-2xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Expertise Required</h3>
              <p className="text-gray-600">Understanding 10-K structure, Exhibit 21, debt footnotes, VIEs, and credit terminology</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            The Solution
          </h2>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            DebtStack does the hard work once, then serves pre-computed data via fast API:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-2xl mb-3">✓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pre-computed & Verified</h3>
              <p className="text-gray-600">85%+ QA score with 5-check verification system. Extract once, serve forever.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-2xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Sub-100ms API response time with ETag caching support</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Individual Instruments</h3>
              <p className="text-gray-600">Each bond, note, and credit facility extracted separately—not just totals</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-2xl mb-3">🏗️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Complex Structures</h3>
              <p className="text-gray-600">Supports VIEs, joint ventures, multiple parents, and partial ownership</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Built for AI Agents
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Native integrations with leading AI frameworks
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">🦜</div>
              <h3 className="font-semibold text-gray-900 mb-2">LangChain</h3>
              <p className="text-sm text-gray-600">Official toolkit integration</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2">MCP Server</h3>
              <p className="text-sm text-gray-600">Native Claude integration</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">🦙</div>
              <h3 className="font-semibold text-gray-900 mb-2">LlamaIndex</h3>
              <p className="text-sm text-gray-600">Complete tool integration</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">REST API</h3>
              <p className="text-sm text-gray-600">Direct API access</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://docs.debtstack.ai"
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2"
            >
              View Documentation
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="px-6 py-20 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Get Early Access
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join the waitlist for DebtStack. We're launching soon with a generous free tier.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </form>
          <p className="text-sm text-blue-100">
            Free tier: S&P 100 companies • 1,000 API calls/month
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold">DebtStack</div>
            <div className="flex gap-8">
              <a
                href="https://github.com/debtstack-ai"
                className="hover:text-blue-400 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/debtstack"
                className="hover:text-blue-400 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
              <a
                href="https://docs.debtstack.ai"
                className="hover:text-blue-400 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2025 DebtStack • hello@debtstack.ai
          </div>
        </div>
      </footer>
    </main>
  );
}
