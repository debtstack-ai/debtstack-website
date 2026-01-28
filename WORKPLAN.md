# WORKPLAN.md - DebtStack Website

Tracking ongoing work, recent changes, and planned improvements.

---

## Recent Changes (2026-01-28)

### Pricing Update
Updated pricing structure across frontend and backend:

| Tier | Price | Queries | Companies |
|------|-------|---------|-----------|
| Free | $0/mo | 25/day | 25 (curated sample) |
| Pro | $49/mo | Unlimited | 200+ (full coverage) |
| Business | $499/mo | Unlimited | 200+ + custom requests |

**Files changed:**
- `app/pricing/page.tsx` - Updated tier cards and CTAs
- `app/page.tsx` - Updated "25 free queries per day" messaging
- `app/dashboard/page.tsx` - Added upgrade buttons, billing management
- `lib/stripe.ts` - New file with Stripe config and tier definitions
- `app/api/stripe/checkout/route.ts` - New Stripe checkout endpoint
- `app/api/stripe/portal/route.ts` - New billing portal endpoint
- `docs/authentication.mdx` - Updated rate limits and pricing tiers
- `docs/api-reference/overview.mdx` - Updated rate limits table

### Stripe Integration (Frontend)
Moved checkout flow to frontend for faster UX:
- Checkout sessions created via `/api/stripe/checkout`
- Billing portal via `/api/stripe/portal`
- Webhooks still handled by backend at `/v1/auth/webhook`

**Stripe Price IDs:**
- Pro: `price_1StwgYAmvjlETourYUAbKPlB`
- Business: `price_1SuFq6AmvjlETourFzfIesa5`

---

## Current Issues

### Build Failure on Railway
- **Symptom**: Build fails on Railway deployment
- **Likely cause**: Missing `STRIPE_SECRET_KEY` environment variable
- **Fix**: Add `STRIPE_SECRET_KEY` to Railway environment variables

### Known Warnings
- Middleware deprecation warning (Next.js recommends "proxy" convention)
- Multiple lockfile warning (can be ignored)

---

## TODO

### High Priority
- [ ] Add `STRIPE_SECRET_KEY` to Railway environment variables
- [ ] Test Stripe checkout flow end-to-end
- [ ] Verify webhook events are received by backend

### Medium Priority
- [ ] Add loading states to upgrade buttons on pricing page
- [ ] Show current plan indicator on pricing page for signed-in users
- [ ] Add email notifications for successful upgrades

### Low Priority
- [ ] Add annual pricing option (2 months free)
- [ ] Implement usage analytics dashboard
- [ ] Add testimonials section to landing page

---

## Backend Sync Required

When updating pricing, also update these files in the `credible/` repo:

1. `app/core/auth.py` - TIER_CREDITS, TIER_RATE_LIMITS
2. `app/core/billing.py` - STRIPE_PRICES, TIER_CONFIG
3. `app/core/config.py` - rate_limit_* settings
4. `docs/PRICING_STRATEGY.md` - Documentation

---

## Architecture Notes

### User Flow
```
1. User visits debtstack.ai
2. Signs up via Clerk modal
3. Frontend calls /api/user to sync with backend
4. Backend creates user + API key, returns to frontend
5. User sees API key in dashboard
6. User clicks "Upgrade to Pro"
7. Frontend creates Stripe checkout session
8. User completes payment on Stripe
9. Stripe webhook hits backend /v1/auth/webhook
10. Backend updates user tier in database
11. User redirected to dashboard with ?upgraded=true
```

### Data Flow
```
Frontend (Next.js)          Backend (FastAPI)           Stripe
       |                           |                      |
       |-- /api/user ------------->|                      |
       |<-- API key, tier ---------|                      |
       |                           |                      |
       |-- /api/stripe/checkout -->|                      |
       |<-- checkout URL ----------|                      |
       |----------------------------------------->| checkout
       |                           |<-- webhook --|
       |                           |-- update DB--|
       |<-- redirect --------------|              |
```

---

## Deployment Checklist

Before deploying:
- [ ] All environment variables set in Railway
- [ ] Stripe webhook configured to hit backend
- [ ] Test checkout flow in Stripe test mode
- [ ] Verify build passes locally with `npm run build`

---

## Session Handoff Notes

*Add notes here for the next session:*

- Railway build is failing - need to add STRIPE_SECRET_KEY env var
- All pricing updates complete in both frontend and backend
- Stripe webhook remains in backend (not frontend)
- Documentation files created: CLAUDE.md, README.md, WORKPLAN.md

---

## Recent Changes (2026-01-28 - Session 2)

### Mintlify Documentation - Demo Scenarios

Added interactive demo scenarios to showcase API capabilities.

**New file:** `docs/guides/scenarios.mdx`

Contains 3 interactive scenarios:
1. **Bond Screener** - Find high-yield secured bonds backed by physical assets
   - GET /v1/bonds with min_ytm, seniority, collateral filters
2. **Corporate Structure** - Who guarantees this bond?
   - POST /v1/entities/traverse with parent_of, guarantees relationships
3. **Document Search** - What triggers a change of control?
   - GET /v1/documents/search with section_type=indenture

Each scenario includes:
- Use case explanation
- Editable ParamField components
- Multi-language code examples (curl, Python, JavaScript)
- Example response with ResponseExample component
- "What to Look For" guidance

**Updated files:**
- `docs/docs.json` - Added scenarios to Guides navigation (first in list)
- `docs/guides/ai-agents.mdx` - Added tip linking to scenarios page

### Database Stats Update

Generalized stats to rounded numbers so they don't go stale:

| Metric | Now Shows |
|--------|-----------|
| Companies | 200+ |
| Entities | 5,000+ |
| Debt Instruments | 2,500+ |
| Guarantees | 5,000+ |
| Document Sections | 6,500+ |
| Collateral Records | 200+ |

**Files updated:**
- `app/page.tsx` - Hero stats
- `app/pricing/page.tsx` - FAQ section
- `docs/introduction.mdx` - Intro card
- `docs/concepts/data-model.mdx` - Coverage table

### Removed Explorer Page

Removed `/explorer` page due to incomplete ownership structure data. Site now has cleaner navigation:

- **Demo** (anchor on home page)
- **Pricing**
- **Docs** (links to Mintlify at kuyperiancapitalllc.mintlify.app)

**Files changed:**
- `app/explorer/page.tsx` - Deleted
- `app/page.tsx` - Updated header and footer nav
- `app/pricing/page.tsx` - Updated header and footer nav

### Improved Intro Copy

Updated Mintlify intro to emphasize credit-relevant documents:
> "200+ companies, 2,500+ debt instruments, and full-text search across indentures, credit agreements, and SEC filings"
