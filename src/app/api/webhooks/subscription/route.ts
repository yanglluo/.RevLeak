/**
 * Subscription Webhook Handler
 * 
 * Handles Stripe webhooks for subscription management:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded (for subscription renewals)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key);
}

/**
 * Update user's subscription status in database
 */
async function updateUserSubscription(
    userId: string,
    stripeCustomerId: string,
    subscriptionId: string,
    status: string,
    plan?: string
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.log('[Subscription Webhook] Supabase not configured, skipping DB update');
        return;
    }

    try {
        await supabase
            .from('profiles')
            .update({
                stripe_customer_id: stripeCustomerId,
                subscription_id: subscriptionId,
                subscription_status: status,
                subscription_plan: plan || 'growth',
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        console.log(`[Subscription Webhook] Updated user ${userId} subscription status to ${status}`);
    } catch (error) {
        console.error('[Subscription Webhook] Error updating user subscription:', error);
    }
}

/**
 * Find user by Stripe customer ID
 */
async function findUserByCustomerId(customerId: string): Promise<string | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (error || !data) {
            return null;
        }

        return data.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature || !WEBHOOK_SECRET) {
            console.error('[Subscription Webhook] Missing signature or webhook secret');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = getStripe().webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
        } catch (err: any) {
            console.error('[Subscription Webhook] Signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        console.log(`[Subscription Webhook] Received event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === 'subscription') {
                    const userId = session.metadata?.userId;
                    const plan = session.metadata?.plan;
                    const customerId = session.customer as string;
                    const subscriptionId = session.subscription as string;

                    if (userId && customerId && subscriptionId) {
                        await updateUserSubscription(
                            userId,
                            customerId,
                            subscriptionId,
                            'active',
                            plan
                        );
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const subscriptionId = subscription.id;
                const status = subscription.status;
                const plan = subscription.metadata?.plan;

                const userId = await findUserByCustomerId(customerId);

                if (userId) {
                    await updateUserSubscription(
                        userId,
                        customerId,
                        subscriptionId,
                        status,
                        plan
                    );
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const userId = await findUserByCustomerId(customerId);

                if (userId) {
                    await updateUserSubscription(
                        userId,
                        customerId,
                        subscription.id,
                        'canceled'
                    );
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                // Only handle subscription invoices
                const subscriptionId = (invoice as any).subscription as string | null;
                if (subscriptionId) {
                    const customerId = invoice.customer as string;

                    const userId = await findUserByCustomerId(customerId);

                    if (userId) {
                        await updateUserSubscription(
                            userId,
                            customerId,
                            subscriptionId,
                            'active'
                        );
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;

                const subscriptionId = (invoice as any).subscription as string | null;
                if (subscriptionId) {
                    const customerId = invoice.customer as string;

                    const userId = await findUserByCustomerId(customerId);

                    if (userId) {
                        await updateUserSubscription(
                            userId,
                            customerId,
                            subscriptionId,
                            'past_due'
                        );
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Subscription Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'healthy',
        message: 'Subscription webhook endpoint active',
        configured: !!WEBHOOK_SECRET,
    });
}
