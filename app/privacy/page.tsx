import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DebtStack',
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use DebtStack, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-gray-900">Account information:</strong> Email address and name provided during registration through Clerk.</li>
              <li><strong className="text-gray-900">Usage data:</strong> API call logs, endpoints accessed, timestamps, and request metadata for billing and analytics.</li>
              <li><strong className="text-gray-900">Payment information:</strong> Processed securely by Stripe. We do not store credit card numbers.</li>
              <li><strong className="text-gray-900">Chat data:</strong> Conversations with Medici (our chat assistant) are stored in your browser and on our servers for session continuity. You may delete any session at any time.</li>
              <li><strong className="text-gray-900">Advertising data:</strong> If you arrive at DebtStack via a Google Ads advertisement, Google may set cookies on your browser to track the ad click and subsequent actions (such as account registration). This data is used solely to measure advertising effectiveness and is processed by Google in accordance with their privacy policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the DebtStack API and chat assistant.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To track API usage for billing and rate limiting.</li>
              <li>To improve our services through anonymized usage analytics.</li>
              <li>To communicate with you about your account or service updates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-gray-900">Clerk:</strong> Authentication and user management.</li>
              <li><strong className="text-gray-900">Stripe:</strong> Payment processing.</li>
              <li><strong className="text-gray-900">PostHog:</strong> Product analytics (pageviews, feature usage).</li>
              <li><strong className="text-gray-900">Sentry:</strong> Error tracking and performance monitoring.</li>
              <li><strong className="text-gray-900">Google Gemini:</strong> Powers the Medici chat assistant.</li>
              <li><strong className="text-gray-900">Google Analytics &amp; Google Ads:</strong> Website traffic analytics and advertising conversion tracking. Google may use cookies to measure ad performance and attribute sign-ups to advertising campaigns. You can opt out of Google&apos;s advertising cookies at <a href="https://adssettings.google.com" className="text-[#2383e2] hover:underline">adssettings.google.com</a>.</li>
            </ul>
            <p className="mt-3">Each service has its own privacy policy governing how they handle your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies and Tracking</h2>
            <p className="mb-3">DebtStack uses cookies and similar technologies for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-gray-900">Essential cookies:</strong> Authentication session management (Clerk).</li>
              <li><strong className="text-gray-900">Analytics cookies:</strong> Google Analytics collects anonymized usage data (pages visited, session duration) to help us improve the service.</li>
              <li><strong className="text-gray-900">Advertising cookies:</strong> Google Ads conversion tracking cookies measure whether ad clicks result in sign-ups or purchases. These cookies are set by Google and governed by Google&apos;s privacy policy. No personally identifiable information is shared with Google for advertising purposes beyond what Google collects through its own cookies.</li>
            </ul>
            <p className="mt-3">You can control cookie preferences through your browser settings. Disabling cookies may affect the functionality of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data, including encrypted API key storage, HTTPS for all communications, and secure authentication via Clerk.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>We retain your account information and usage logs for as long as your account is active. API call logs are retained for billing reconciliation. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Export your data in a portable format.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:debtstackai@gmail.com" className="text-[#2383e2] hover:underline">debtstackai@gmail.com</a>.</p>
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
