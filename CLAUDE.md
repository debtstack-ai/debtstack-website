# CLAUDE.md - DebtStack Website

This file provides context for Claude Code when working on this repository.

## Project Overview

DebtStack Website is the Next.js frontend for DebtStack.ai - an API platform providing corporate debt structure data for AI agents. This repo handles the marketing site, user dashboard, authentication, Stripe billing integration, and an AI chat assistant.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Stripe
- **Analytics**: Vercel Analytics + PostHog (events, funnels, session replay)
- **Error Tracking**: Sentry (client + server)
- **Styling**: Tailwind CSS v4
- **AI**: Google Generative AI SDK (`@google/generative-ai`) — Gemini-powered chat assistant
- **Language**: TypeScript
- **Deployment**: Railway

## Project Structure

```
debtstack-website/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── chat/          # Chat SSE streaming endpoint (Gemini + tool-use)
│   │   ├── stripe/        # Stripe checkout & portal
│   │   ├── user/          # User sync with backend
│   │   └── waitlist/      # Waitlist signup
│   ├── dashboard/         # User dashboard (API key, usage, billing)
│   │   └── chat/          # Full-page chat assistant
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
│   └── chat/              # Chat assistant utilities
│       ├── tools.ts       # 8 Gemini tool definitions (FunctionDeclaration format)
│       ├── system-prompt.ts # System prompt for Gemini
│       ├── tool-executor.ts # Execute tools against DebtStack API
│       └── prompts.ts     # Starter prompt library (14 prompts, 4 categories)
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
  - Database: PostgreSQL

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
- Backend URL: `https://api.debtstack.ai` (points to `credible-ai-production.up.railway.app`)
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

### Chat Assistant (Gemini + DebtStack API)
- Full-page chat at `/dashboard/chat` — authenticated users ask credit questions in natural language
- Gemini 2.5 Flash (`gemini-2.5-flash`) acts as agent, calling 8 DebtStack API tools via tool-use loop
- **Architecture**: Browser → `POST /api/chat` (SSE) → Gemini (up to 5 tool-use rounds) → `api.debtstack.ai` (user's API key)
- **API route** (`app/api/chat/route.ts`): Authenticated via Clerk, streams SSE events (`text`, `tool_call`, `tool_result`, `done`, `error`)
- **Tool definitions** (`lib/chat/tools.ts`): 8 tools ported from MCP server — `search_companies`, `search_bonds`, `resolve_bond`, `get_guarantors`, `get_corporate_structure`, `search_pricing`, `search_documents`, `get_changes`
- **Safety**: Max 5 tool-use rounds, max 50 messages/conversation, 15s timeout per API call, results truncated to 20 items
- **State**: Chat history + watchlists in `localStorage` (no server-side state, no new DB tables)
- **Gating**: Requires `userData.api_key` to be available (full key, not just prefix) — users without it see a "regenerate key" prompt
- **Cost**: DebtStack API costs ($0.05-$0.15/tool call) tracked per session. Gemini inference cost (~$0.001-0.005/turn) absorbed by DebtStack
- **Features**: Chat history with search, starter prompt library (14 prompts in 4 categories), suggested follow-ups (parsed from Gemini response), ticker watchlists

### Sentry
- `sentry.client.config.ts` (browser) + `sentry.server.config.ts` (server)
- `next.config.ts` wrapped with `withSentryConfig()` for source map uploads
- 10% trace sampling, no session replay (PostHog handles that)
- Silently disabled when `NEXT_PUBLIC_SENTRY_DSN` is not set

## Pricing Tiers

| Tier | Price | Queries | Features |
|------|-------|---------|----------|
| Pay-as-You-Go | $0/mo | Pay per call ($0.05-$0.15) | 211 companies, 60 rpm |
| Pro | $199/mo | Unlimited | 211 companies, 100 rpm |
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

# Google Gemini (required for chat assistant)
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
