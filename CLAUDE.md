# CLAUDE.md - DebtStack Website

This file provides context for Claude Code when working on this repository.

## Project Overview

DebtStack Website is the Next.js frontend for DebtStack.ai - an API platform providing corporate debt structure data for AI agents. This repo handles the marketing site, user dashboard, authentication, and Stripe billing integration.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Stripe
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Railway

## Project Structure

```
debtstack-website/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── stripe/        # Stripe checkout & portal
│   │   ├── user/          # User sync with backend
│   │   └── waitlist/      # Waitlist signup
│   ├── dashboard/         # User dashboard (API key, usage, billing)
│   ├── pricing/           # Pricing page
│   └── page.tsx           # Landing page
├── docs/                   # Mintlify documentation (docs.debtstack.ai)
├── lib/                    # Shared utilities
│   └── stripe.ts          # Stripe client & tier config
├── public/                 # Static assets
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
- Price IDs:
  - Pro ($49/mo): `price_1StwgYAmvjlETourYUAbKPlB`
  - Business ($499/mo): `price_1SuFq6AmvjlETourFzfIesa5`

### Backend Communication
- Backend URL: `https://credible-ai-production.up.railway.app`
- Frontend syncs users to backend on first login
- Backend manages API keys, rate limits, and credit tracking

## Pricing Tiers

| Tier | Price | Queries | Companies |
|------|-------|---------|-----------|
| Free | $0/mo | 25/day | 25 (curated sample) |
| Pro | $49/mo | Unlimited | 200+ (full coverage) |
| Business | $499/mo | Unlimited | 200+ + custom requests |

## Environment Variables

Required in `.env.local` and Railway:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...

# Backend
BACKEND_URL=https://credible-ai-production.up.railway.app

# App
NEXT_PUBLIC_APP_URL=https://debtstack.ai
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
