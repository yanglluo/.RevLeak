import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        if (!isStripeConfigured()) {
            return NextResponse.json(
                { error: 'Stripe is not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session ID' },
                { status: 400 }
            );
        }

        const stripe = getStripe();

        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer'],
        });

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { success: false, error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Update user profile in Supabase if configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey && session.metadata?.userId) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const subscription = session.subscription as any;
            const customer = session.customer as any;

            await supabase
                .from('profiles')
                .update({
                    stripe_customer_id: customer?.id || session.customer,
                    subscription_status: subscription?.status || 'active',
                    subscription_plan: session.metadata?.plan || 'growth',
                    subscription_id: subscription?.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', session.metadata.userId);
        }

        return NextResponse.json({
            success: true,
            subscription: {
                status: (session.subscription as any)?.status || 'active',
                plan: session.metadata?.plan || 'growth',
            },
        });
    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Verification failed' },
            { status: 500 }
        );
    }
}
