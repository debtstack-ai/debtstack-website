// app/api/stripe/checkout/route.ts
// Creates Stripe Checkout sessions for Pro/Business upgrades and credit purchases

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES, STRIPE_CREDIT_PRICES, PaidTierName, CreditAmount } from '@/lib/stripe';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.debtstack.ai';

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

    const { tier, creditAmount, successUrl, cancelUrl } = await request.json();
    const email = user.primaryEmailAddress.emailAddress;

    // Determine if this is a subscription or credit purchase
    let priceId: string;
    let mode: 'subscription' | 'payment';
    let metadata: Record<string, string>;

    if (creditAmount) {
      // Credit package purchase
      const amount = Number(creditAmount);
      if (![10, 25, 50, 100].includes(amount)) {
        return NextResponse.json({ error: 'Invalid credit amount. Must be 10, 25, 50, or 100' }, { status: 400 });
      }
      priceId = STRIPE_CREDIT_PRICES[amount as CreditAmount];
      mode = 'payment';
      metadata = {
        clerk_id: userId,
        email: email,
        type: 'credit_purchase',
        credit_amount: String(amount),
      };
    } else if (tier) {
      // Subscription upgrade
      if (!['pro', 'business'].includes(tier)) {
        return NextResponse.json({ error: 'Invalid tier. Must be "pro" or "business"' }, { status: 400 });
      }
      priceId = STRIPE_PRICES[tier as PaidTierName];
      mode = 'subscription';
      metadata = {
        clerk_id: userId,
        email: email,
        tier: tier,
      };
    } else {
      return NextResponse.json({ error: 'Must specify either tier or creditAmount' }, { status: 400 });
    }

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

    // Build checkout session options
    const sessionOptions: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://debtstack.ai'}/dashboard?${creditAmount ? 'credits=purchased' : `upgraded=${tier}`}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://debtstack.ai'}/pricing`,
      metadata: metadata,
    };

    // Add subscription_data only for subscription mode
    if (mode === 'subscription') {
      sessionOptions.subscription_data = {
        metadata: metadata,
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

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
