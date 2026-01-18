// API Route: Leak actions (resolve, dismiss, retry)

import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, leakId, invoiceId, subscriptionId, customerId } = body;

        if (!isStripeConfigured()) {
            return NextResponse.json(
                { success: false, error: 'Stripe not configured' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'retry_payment': {
                if (!invoiceId) {
                    return NextResponse.json(
                        { success: false, error: 'Invoice ID required for retry' },
                        { status: 400 }
                    );
                }

                // Attempt to pay the invoice
                const invoice = await stripe.invoices.pay(invoiceId);

                return NextResponse.json({
                    success: true,
                    message: 'Payment retry initiated',
                    data: {
                        invoiceId: invoice.id,
                        status: invoice.status,
                        paid: invoice.status === 'paid',
                    },
                });
            }

            case 'send_reminder': {
                if (!invoiceId) {
                    return NextResponse.json(
                        { success: false, error: 'Invoice ID required' },
                        { status: 400 }
                    );
                }

                // Send invoice reminder
                const invoice = await stripe.invoices.sendInvoice(invoiceId);

                return NextResponse.json({
                    success: true,
                    message: 'Payment reminder sent',
                    data: {
                        invoiceId: invoice.id,
                    },
                });
            }

            case 'create_payment_link': {
                if (!customerId) {
                    return NextResponse.json(
                        { success: false, error: 'Customer ID required' },
                        { status: 400 }
                    );
                }

                // Create a billing portal session for the customer to update payment method
                const session = await stripe.billingPortal.sessions.create({
                    customer: customerId,
                    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/leaks`,
                });

                return NextResponse.json({
                    success: true,
                    message: 'Payment update link created',
                    data: {
                        url: session.url,
                    },
                });
            }

            case 'dismiss': {
                // In a real app, this would update the leak status in the database
                return NextResponse.json({
                    success: true,
                    message: 'Leak dismissed',
                    data: { leakId },
                });
            }

            case 'resolve': {
                // In a real app, this would mark the leak as resolved in the database
                return NextResponse.json({
                    success: true,
                    message: 'Leak marked as resolved',
                    data: { leakId },
                });
            }

            default:
                return NextResponse.json(
                    { success: false, error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('[Leaks API] Error:', error);

        // Handle specific Stripe errors
        if (error.type === 'StripeCardError') {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    code: error.code
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Action failed' },
            { status: 500 }
        );
    }
}
