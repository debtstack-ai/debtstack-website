import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DebtStack',
};

export default function TermsPage() {
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
              API
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: February 19, 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using DebtStack (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>DebtStack provides a REST API and chat assistant (Medici) for accessing corporate debt structure data, bond pricing, covenant analysis, and related financial information. Data is sourced from public SEC filings and FINRA TRACE.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accounts and API Keys</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must create an account to use the Service.</li>
              <li>You are responsible for maintaining the security of your API key.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Do not share your API key with unauthorized parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Billing and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay-as-You-Go users are charged per API call at published rates.</li>
              <li>Pro ($199/month) and Business ($499/month) subscriptions are billed monthly via Stripe.</li>
              <li>Purchased credits do not expire.</li>
              <li>Subscriptions can be cancelled at any time from your dashboard.</li>
              <li>Refunds are handled on a case-by-case basis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resell or redistribute DebtStack data without authorization.</li>
              <li>Exceed your rate limits or attempt to circumvent usage controls.</li>
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, decompile, or extract source data from the API.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Accuracy Disclaimer</h2>
            <p>DebtStack provides financial data extracted from public SEC filings and FINRA TRACE. While we make every effort to ensure accuracy, we do not guarantee that all data is complete, current, or error-free. DebtStack data is provided for informational purposes and should not be considered investment advice. You are responsible for verifying any data used in investment decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, DebtStack shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to investment losses based on data provided by the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
            <p>We aim to maintain high availability but do not guarantee uninterrupted access. Business tier customers receive a 99.9% uptime SLA. We reserve the right to modify, suspend, or discontinue the Service with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p>The DebtStack API, documentation, website, and Medici chat assistant are the intellectual property of DebtStack. The underlying financial data sourced from SEC filings is public information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms. We will notify users of material changes via email.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:debtstackai@gmail.com" className="text-[#2383e2] hover:underline">debtstackai@gmail.com</a>.</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-32 w-auto invert" />
            </a>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="/pricing" className="hover:text-gray-900 transition">Pricing</a>
              <a href="/blog" className="hover:text-gray-900 transition">Blog</a>
              <a href="https://docs.debtstack.ai" className="hover:text-gray-900 transition">Docs</a>
              <a href="mailto:debtstackai@gmail.com" className="hover:text-gray-900 transition">Contact</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <span>&copy; 2026 DebtStack</span>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-900 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
