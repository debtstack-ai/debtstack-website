// lib/stripe.ts
// Stripe configuration and utilities

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

// Price IDs for each tier
export const STRIPE_PRICES = {
  pro: 'price_1StwgYAmvjlETourYUAbKPlB',      // $49/month
  business: 'price_1SuFq6AmvjlETourFzfIesa5', // $499/month
} as const;

// Tier configuration
export const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    queries: '25/day',
    companies: 25,
    features: [
      '25 queries/day',
      '25 companies (curated sample)',
      'All endpoints',
      'Bond pricing (updated throughout trading day)',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    queries: 'Unlimited',
    companies: 200,
    features: [
      'Everything in Free, plus:',
      'Unlimited queries',
      '200+ companies (full coverage)',
      'Historical pricing trends',
    ],
  },
  business: {
    name: 'Business',
    price: 499,
    queries: 'Unlimited',
    companies: 200,
    features: [
      'Everything in Pro, plus:',
      'Priority support (24hr response)',
      'Custom company coverage requests',
      '99.9% uptime SLA',
      'Dedicated onboarding',
    ],
  },
} as const;

export type TierName = keyof typeof TIER_CONFIG;
export type PaidTierName = keyof typeof STRIPE_PRICES;
