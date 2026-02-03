import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | DebtStack Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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

      {/* Article */}
      <article className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-block text-sm text-gray-500 hover:text-white transition mb-8"
          >
            &larr; Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' '}&middot;{' '}{post.author}
            </p>
          </header>

          {/* Content */}
          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Try DebtStack
          </h2>
          <p className="text-gray-400 mb-8">
            Start with 25 free queries per day. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition"
              >
                Go to Dashboard
              </a>
            </SignedIn>
            <a
              href="https://docs.debtstack.ai"
              className="text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:text-white transition border border-gray-800 hover:border-gray-600"
            >
              View Docs
            </a>
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
