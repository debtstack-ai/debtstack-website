# CLAUDE.md - DebtStack Website

This file provides context for Claude Code when working on this repository.

## Project Overview

DebtStack Website is the Next.js frontend for DebtStack.ai - an API platform providing corporate debt structure data for AI agents. This repo handles the marketing site, user dashboard, authentication, Stripe billing integration, and Medici (the AI chat assistant).

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Stripe
- **Analytics**: Vercel Analytics + PostHog (events, funnels, session replay)
- **Error Tracking**: Sentry (client + server)
- **Styling**: Tailwind CSS v4
- **AI**: Migrating from Google Generative AI SDK → Anthropic SDK (`@anthropic-ai/sdk`) — powers Medici with Claude Sonnet 4.6 + 8 auto-triggered skills
- **Language**: TypeScript
- **Deployment**: Railway

## Project Structure

```
debtstack-website/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── chat/          # Chat SSE streaming endpoint (Claude + skills + tool-use)
│   │   ├── stripe/        # Stripe checkout & portal
│   │   ├── user/          # User sync with backend
│   │   └── waitlist/      # Waitlist signup
│   ├── dashboard/         # User dashboard (API key, usage, billing)
│   │   └── chat/          # Medici — full-page chat assistant
│   │       ├── page.tsx   # Chat page (gates on API key)
│   │       └── components/
│   │           ├── ChatLayout.tsx    # Sidebar + main area layout
│   │           ├── ChatMessages.tsx  # Message display with markdown + tool pills
│   │           └── ChatInput.tsx     # Auto-resize input with keyboard shortcuts
│   ├── pricing/           # Pricing page
│   ├── providers.tsx      # PostHog initialization + pageview tracking
│   ├── layout.tsx         # Root layout (Clerk, PostHog, Vercel Analytics)
│   └── page.tsx           # Landing page
├── docs/                   # Mintlify documentation (docs.debtstack.ai)
├── lib/                    # Shared utilities
│   ├── stripe.ts          # Stripe client & tier config
│   └── chat/              # Medici chat assistant utilities
│       ├── tools.ts       # 19 Anthropic Tool[] definitions (converted from Gemini format)
│       ├── system-prompt.ts # Slim system prompt (~4KB voice/tone/conventions — workflow routing moved to skills)
│       ├── tool-executor.ts # Execute tools against DebtStack API (model-agnostic)
│       ├── knowledge.ts   # RAG retrieval: embed query → pgvector → knowledge chunks
│       └── prompts.ts     # Starter prompt library (14 prompts, 4 categories)
├── .claude/
│   └── skills/            # 8 SKILL.md files (auto-triggered analytical workflows)
│       ├── valuation-analysis/
│       ├── distress-assessment/
│       ├── credit-snapshot/
│       ├── recovery-analysis/
│       ├── relative-value/
│       ├── capital-structure/
│       ├── covenant-deep-dive/
│       └── liquidity-check/
├── public/                 # Static assets
├── sentry.client.config.ts # Sentry browser config
├── sentry.server.config.ts # Sentry server config
└── middleware.ts          # Clerk auth middleware
```

## Related Repositories

- **Backend API** (`credible/`): Python/FastAPI backend on Railway
  - Handles all API endpoints (`/v1/companies`, `/v1/bonds`, etc.)
  - User authentication via API keys
  - Stripe webhooks at `/v1/auth/webhook`
  - Database: PostgreSQL (Neon + pgvector)
- **Medici Knowledge Base** (`credible/medici/`): Knowledge files, ingestion scripts, and RAG pipeline config
  - See `credible/medici/CLAUDE.md` for knowledge base rules, RAG architecture, and ingestion instructions

## Key Integrations

### Clerk Authentication
- Users sign up/in via Clerk modal
- After auth, user is synced to backend via `/api/user` route
- Backend creates API key and returns it to frontend

### Stripe Billing
- **Checkout**: `/api/stripe/checkout` creates Stripe sessions
- **Portal**: `/api/stripe/portal` for subscription management
- **Webhooks**: Handled by backend at `/v1/auth/webhook`
- Price IDs (configured via environment variables):
  - Pro ($199/mo): `STRIPE_PRO_PRICE_ID`
  - Business ($499/mo): `STRIPE_BUSINESS_PRICE_ID`
  - Credit Packages ($10, $25, $50, $100): `STRIPE_CREDITS_*_PRICE_ID`

### Backend Communication
- Backend URL: `https://api.debtstack.ai`
- Frontend syncs users to backend on first login
- Backend manages API keys, rate limits, and credit tracking

### Vercel Analytics
- `<Analytics />` component in `app/layout.tsx` — auto-tracks page views
- Enable in Vercel dashboard → Analytics tab (free tier)

### PostHog
- Initialized in `app/providers.tsx` with automatic pageview tracking
- Identifies authenticated users via Clerk `useUser()` hook
- Custom events tracked: `viewed_pricing`, `clicked_subscribe`, `viewed_dashboard`, `copied_api_key`
- Guarded by `NEXT_PUBLIC_POSTHOG_KEY` — silently disabled when not set

### Medici — Chat Assistant (MIGRATING: Gemini → Claude + Skills)
- **Medici** is DebtStack's named chat assistant (named after the Medici banking family that pioneered modern finance)
- Full-page chat at `/dashboard/chat` — authenticated users ask credit questions in natural language
- **Model migration in progress**: Gemini 2.5 Pro → **Claude Sonnet 4.6** via Anthropic SDK with prompt caching
- **Skills**: 8 SKILL.md files in `.claude/skills/` — auto-triggered analytical workflows (valuation, distress, credit snapshot, recovery, relative value, capital structure, covenant, liquidity). Each skill defines trigger patterns, allowed tools, tool sequence, and interpretation rules.
- **Architecture (target)**: Browser → `POST /api/chat` (SSE) → skill matching + RAG knowledge → Claude Sonnet 4.6 (autonomous tool loop) → `api.debtstack.ai` (user's API key)
- **Architecture (current)**: Browser → `POST /api/chat` (SSE) → RAG knowledge retrieval → Gemini (up to 5 tool-use rounds) → `api.debtstack.ai` (user's API key)
- **API route** (`app/api/chat/route.ts`): Authenticated via Clerk, streams SSE events (`text`, `tool_call`, `tool_result`, `done`, `error`). Being rewritten from Gemini SDK to Anthropic SDK.
- **Tool definitions**: 19 tools — 14 data retrieval + 5 analysis compute. `tools.ts` converting from Gemini `FunctionDeclaration[]` to Anthropic `Tool[]` format. `tool-executor.ts` kept as-is (model-agnostic, calls `api.debtstack.ai`).
- **RAG Knowledge Retrieval** (`lib/chat/knowledge.ts`): On each user message, embeds query with Gemini `gemini-embedding-001`, searches `knowledge_chunks` table (Neon pgvector) for top 3 similar chunks. 78 chunks from 13 knowledge files. Will supplement skills at Level 2B.
- **Safety**: Max 5 tool-use rounds, max 50 messages/conversation, 15s timeout per API call, results truncated to 20 items
- **State**: Chat history + watchlists in `localStorage` (no server-side state, no new DB tables)
- **Gating**: Requires `userData.api_key` to be available (full key, not just prefix) — users without it see a "regenerate key" prompt
- **Branding**: All UI references use "Medici" (nav links, welcome screen, input placeholder, header). System prompt identifies as "Medici, the credit data assistant built by DebtStack.ai"
- **Cost (target)**: DebtStack API costs ($0.05-$0.15/tool call, $0.10 for analysis tools) + ~$0.02/turn inference (Claude Sonnet 4.6 with prompt caching) + ~$0.00001/turn for query embedding
- **Features**: Chat history with search, starter prompt library (14 prompts in 4 categories), suggested follow-ups, ticker watchlists, live SEC research for non-covered companies, RAG-powered credit analysis frameworks, 8 auto-triggered analytical skills
- **Live SEC Research**: `research_company` tool fetches 10-K from EDGAR, extracts debt instruments via Gemini. Results labeled "Live SEC Filing Research". Coverage request button (parsed from `<!--request_coverage:...-->` tag) lets users request full coverage.

### Sentry
- `sentry.client.config.ts` (browser) + `sentry.server.config.ts` (server)
- `next.config.ts` wrapped with `withSentryConfig()` for source map uploads
- 10% trace sampling, no session replay (PostHog handles that)
- Silently disabled when `NEXT_PUBLIC_SENTRY_DSN` is not set

## Pricing Tiers

| Tier | Price | Queries | Features |
|------|-------|---------|----------|
| Pay-as-You-Go | $0/mo | Pay per call ($0.05-$0.15) | 291 companies, 60 rpm |
| Pro | $199/mo | Unlimited | 291 companies, 100 rpm |
| Business | $499/mo | Unlimited | Historical pricing, bulk export, 5 team seats, 500 rpm |

## Environment Variables

Required in `.env.local` and Railway:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...

# Backend
BACKEND_URL=https://api.debtstack.ai

# App
NEXT_PUBLIC_APP_URL=https://debtstack.ai

# PostHog (optional — analytics disabled if not set)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Anthropic (required for Medici chat assistant — replacing Gemini)
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini (still used for RAG embeddings via gemini-embedding-001; chat model migrating to Claude)
GEMINI_API_KEY=...

# Sentry (optional — error tracking disabled if not set)
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.us.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=debtstack
SENTRY_PROJECT=debtstack-website
```

## Common Tasks

### Local Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Update Pricing
1. Update `lib/stripe.ts` - TIER_CONFIG and STRIPE_PRICES
2. Update `app/pricing/page.tsx` - tiers array
3. Update `docs/authentication.mdx` - pricing tiers section
4. Update backend `credible/app/core/billing.py` - TIER_CONFIG

### Add New API Route
Create file at `app/api/[route]/route.ts` with GET/POST exports.

## Known Issues

- Build requires STRIPE_SECRET_KEY to be set (uses lazy initialization to avoid build-time errors)
- Middleware deprecation warning (Next.js recommends "proxy" convention)

## Code Conventions

- Use `'use client'` directive for interactive components
- Wrap `useSearchParams()` in Suspense boundary
- Keep API routes minimal - heavy logic in backend
- Use Tailwind for all styling (dark theme: bg-black, text-white)
