// lib/stripe.ts
// Stripe configuration and utilities for three-tier pricing

import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// =============================================================================
// Three-Tier Pricing Configuration
// =============================================================================

// Subscription Price IDs (update these in Stripe Dashboard)
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_199',      // $199/month
  business: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_499', // $499/month
} as const;

// Credit Package Price IDs (one-time payments)
export const STRIPE_CREDIT_PRICES = {
  10: process.env.STRIPE_CREDITS_10_PRICE_ID || 'price_credits_10',   // $10 credit package
  25: process.env.STRIPE_CREDITS_25_PRICE_ID || 'price_credits_25',   // $25 credit package
  50: process.env.STRIPE_CREDITS_50_PRICE_ID || 'price_credits_50',   // $50 credit package
  100: process.env.STRIPE_CREDITS_100_PRICE_ID || 'price_credits_100', // $100 credit package
} as const;

// Tier configuration
export const TIER_CONFIG = {
  pay_as_you_go: {
    name: 'Pay-as-You-Go',
    price: 0,
    rateLimit: 60,
    teamSeats: 1,
    queries: 'Pay per call',
    companies: 200,
    features: [
      'Pay per API call ($0.05-$0.15)',
      '60 requests/minute',
      '200+ companies',
      'All basic endpoints',
      'Bond pricing data',
    ],
    endpointCosts: {
      simple: 0.05,   // /v1/companies, /v1/bonds, /v1/financials, etc.
      complex: 0.10,  // /v1/companies/{ticker}/changes
      advanced: 0.15, // /v1/entities/traverse, /v1/documents/search
    },
    excluded: [
      '/v1/covenants/compare',
      '/v1/bonds/{cusip}/pricing/history',
      '/v1/export',
      '/v1/usage/analytics',
    ],
  },
  pro: {
    name: 'Pro',
    price: 199,
    rateLimit: 100,
    teamSeats: 1,
    queries: 'Unlimited',
    companies: 200,
    features: [
      'Unlimited API queries',
      '100 requests/minute',
      '200+ companies',
      'All basic endpoints',
      'Bond pricing data',
    ],
    excluded: [
      '/v1/covenants/compare',
      '/v1/bonds/{cusip}/pricing/history',
      '/v1/export',
      '/v1/usage/analytics',
    ],
  },
  business: {
    name: 'Business',
    price: 499,
    rateLimit: 500,
    teamSeats: 5,
    queries: 'Unlimited',
    companies: 200,
    features: [
      'Everything in Pro, plus:',
      '500 requests/minute',
      '5 team seats',
      'Covenant comparison endpoint',
      'Historical bond pricing',
      'Bulk data export',
      'Usage analytics dashboard',
      'Priority support (24hr response)',
      'Custom company coverage requests',
      '99.9% uptime SLA',
    ],
    excluded: [], // Full access
  },
} as const;

// Credit packages for Pay-as-You-Go users
export const CREDIT_PACKAGES = [
  { amount: 10, queries: '~200 simple queries', description: 'Good for testing' },
  { amount: 25, queries: '~500 simple queries', description: 'Light usage' },
  { amount: 50, queries: '~1,000 simple queries', description: 'Regular usage' },
  { amount: 100, queries: '~2,000 simple queries', description: 'Heavy usage' },
] as const;

export type TierName = keyof typeof TIER_CONFIG;
export type PaidTierName = keyof typeof STRIPE_PRICES;
export type CreditAmount = keyof typeof STRIPE_CREDIT_PRICES;
