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
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative px-6 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto" />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/#demo" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Demo
            </a>
            <a href="/pricing" className="text-gray-400 hover:text-white transition text-sm font-medium">
              Pricing
            </a>
            <a href="/blog" className="text-white transition text-sm font-medium">
              Blog
            </a>
            <a href="https://docs.debtstack.ai" className="text-gray-400 hover:text-white transition text-sm font-medium">
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

      {/* Hero */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights on credit data, AI in finance, and the future of debt markets.
          </p>
        </div>
      </section>

      {/* Post Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/80 transition-all duration-300"
              >
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' '}&middot;{' '}{post.author}
                </p>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="inline-block mt-4 text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                  Read more &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/">
              <img src="/logo-transparent.png" alt="DebtStack" className="h-32 w-auto" />
            </a>
            <div className="flex gap-8 text-gray-400">
              <a href="/#demo" className="hover:text-white transition">Demo</a>
              <a href="/pricing" className="hover:text-white transition">Pricing</a>
              <a href="/blog" className="hover:text-white transition">Blog</a>
              <a href="https://docs.debtstack.ai" className="hover:text-white transition">Docs</a>
              <a href="mailto:hello@debtstack.ai" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-600">
            &copy; 2026 DebtStack
          </div>
        </div>
      </footer>
    </main>
  );
}
