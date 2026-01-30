// app/api/stripe/checkout/route.ts
// Creates Stripe Checkout sessions for Pro/Business upgrades

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES, PaidTierName } from '@/lib/stripe';

const BACKEND_URL = process.env.BACKEND_URL || 'https://credible-ai-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    const { tier, successUrl, cancelUrl } = await request.json();

    // Validate tier
    if (!tier || !['pro', 'business'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier. Must be "pro" or "business"' }, { status: 400 });
    }

    const priceId = STRIPE_PRICES[tier as PaidTierName];
    const email = user.primaryEmailAddress.emailAddress;

    // Check if user already has a Stripe customer ID in our backend
    // For now, we'll create/find customer directly in Stripe
    let customerId: string | undefined;

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          clerk_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://debtstack.ai'}/dashboard?upgraded=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://debtstack.ai'}/pricing`,
      metadata: {
        clerk_id: userId,
        email: email,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          clerk_id: userId,
          email: email,
          tier: tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
