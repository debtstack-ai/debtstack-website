import { getAllPosts } from '@/lib/blog';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | DebtStack',
  description: 'Insights on credit data, AI in finance, and the future of debt markets.',
  openGraph: {
    title: 'Blog | DebtStack',
    description: 'Insights on credit data, AI in finance, and the future of debt markets.',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#EAECF0] text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto invert" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/#demo" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Demo
            </a>
            <a href="/pricing" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-gray-900 transition text-sm font-medium">
              Blog
            </a>
            <a href="https://docs.debtstack.ai" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
              Docs
            </a>
            <SignedOut>
              <a href="/chat" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Chat
              </a>
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
              <a href="/dashboard/chat" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Chat
              </a>
              <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex gap-16">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-8">
              <nav className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-medium">Navigate</p>
                <a href="/" className="block text-sm text-gray-500 hover:text-gray-900 transition">Home</a>
                <a href="/blog" className="block text-sm text-gray-900 font-medium">Blog</a>
                <a href="/pricing" className="block text-sm text-gray-500 hover:text-gray-900 transition">Pricing</a>
                <a href="https://docs.debtstack.ai" className="block text-sm text-gray-500 hover:text-gray-900 transition">Docs</a>
              </nav>

              <div className="mt-10">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-medium">Essays</p>
                <nav className="space-y-2">
                  {posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block text-sm text-gray-500 hover:text-gray-900 transition"
                    >
                      {post.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="space-y-0">
              {posts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={`group block py-8 ${
                    i > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <p className="text-sm text-gray-400 mb-2">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <h2 className="text-2xl font-semibold mb-3 group-hover:text-[#2383e2] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed max-w-2xl">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-32 w-auto invert" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a href="/#demo" className="hover:text-gray-900 transition">Demo</a>
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
