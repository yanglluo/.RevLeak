import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        if (!isStripeConfigured()) {
            return NextResponse.json(
                { error: 'Stripe is not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { priceId, userId, email, plan } = body;

        if (!priceId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const stripe = getStripe();

        // Create or get Stripe customer
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        let customerId: string;

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId || '',
                    plan: plan || 'growth',
                },
            });
            customerId = customer.id;
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#pricing`,
            metadata: {
                userId: userId || '',
                plan: plan || 'growth',
            },
            subscription_data: {
                metadata: {
                    userId: userId || '',
                    plan: plan || 'growth',
                },
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Checkout failed' },
            { status: 500 }
        );
    }
}
