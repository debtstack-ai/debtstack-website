# DebtStack Website

Marketing website, user dashboard, and billing for [DebtStack.ai](https://debtstack.ai) - the API for corporate debt structure data.

## Features

- Landing page with live product demo
- User dashboard with API key management
- Stripe-powered billing (Free, Pro, Business tiers)
- Mintlify documentation

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `BACKEND_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | This app's public URL |

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Mintlify](https://mintlify.com/) - Documentation

## Project Structure

```
├── app/
│   ├── api/stripe/      # Stripe checkout & portal
│   ├── api/user/        # User sync with backend
│   ├── dashboard/       # User dashboard
│   ├── pricing/         # Pricing page
│   └── page.tsx         # Landing page
├── docs/                # Mintlify docs (docs.debtstack.ai)
├── lib/stripe.ts        # Stripe configuration
└── public/              # Static assets
```

## Deployment

Deployed on [Railway](https://railway.app). Push to `main` triggers automatic deployment.

### Required Railway Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `BACKEND_URL`
- `NEXT_PUBLIC_APP_URL`

## Related

- **Backend API**: [api.debtstack.ai](https://api.debtstack.ai/docs)
- **Documentation**: [docs.debtstack.ai](https://docs.debtstack.ai)

## License

Proprietary - All rights reserved.

