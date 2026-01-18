// Leak Detection Engine
// Identifies preventable revenue loss from Stripe data

import Stripe from 'stripe';
import { getSubscriptionHealth } from './stripe';

export type LeakType =
    | 'payment_failed'
    | 'subscription_past_due'
    | 'card_expiring'
    | 'card_expired'
    | 'disputed'
    | 'canceled_recoverable';

export type LeakPriority = 'critical' | 'warning' | 'info';

export interface DetectedLeak {
    id: string;
    type: LeakType;
    priority: LeakPriority;
    title: string;
    description: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    subscriptionId?: string;
    invoiceId?: string;
    amount: number; // Monthly recurring amount at risk
    currency: string;
    detectedAt: Date;
    interventionWindowHours: number; // Hours remaining to prevent loss
    failureReason?: string;
    retryCount?: number;
    metadata: Record<string, unknown>;
}

// Calculate intervention window based on Stripe retry settings
function calculateInterventionWindow(
    type: LeakType,
    createdAt: Date,
    retryCount: number = 0
): number {
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Default intervention windows by type
    const windows: Record<LeakType, number> = {
        payment_failed: 72 - hoursSinceCreated, // 3 days default
        subscription_past_due: 168 - hoursSinceCreated, // 7 days
        card_expiring: 720, // 30 days warning
        card_expired: 48, // 2 days urgent
        disputed: 168, // 7 days for evidence
        canceled_recoverable: 48, // 2 days win-back window
    };

    // Reduce window based on retry count
    const adjustment = retryCount * 24; // Each retry reduces window by 1 day
    return Math.max(0, windows[type] - adjustment);
}

// Detect leaks from failed invoices
export function detectPaymentFailures(invoices: Stripe.Invoice[]): DetectedLeak[] {
    return invoices
        .filter(inv => inv.attempted && inv.status !== 'paid')
        .map(inv => {
            const i = inv as any; // Cast for snake_case properties
            const customer = inv.customer as Stripe.Customer;
            const attemptCount = i.attempt_count || 0;

            // Map Stripe failure codes to readable reasons
            const failureReason = inv.last_finalization_error?.message ||
                inv.status_transitions?.finalized_at ? 'Payment declined' : 'Unknown failure';

            return {
                id: `leak_${inv.id}`,
                type: 'payment_failed' as LeakType,
                priority: attemptCount >= 2 ? 'critical' : 'warning' as LeakPriority,
                title: 'Payment Failed',
                description: `Invoice payment failed after ${attemptCount} attempt(s)`,
                customerId: customer?.id || '',
                customerEmail: customer?.email || 'unknown',
                customerName: customer?.name || customer?.email || 'Unknown Customer',
                subscriptionId: typeof i.subscription === 'string' ? i.subscription : i.subscription?.id,
                invoiceId: inv.id,
                amount: (inv.amount_due || 0) / 100,
                currency: inv.currency.toUpperCase(),
                detectedAt: new Date((inv.created || 0) * 1000),
                interventionWindowHours: calculateInterventionWindow(
                    'payment_failed',
                    new Date((inv.created || 0) * 1000),
                    attemptCount
                ),
                failureReason,
                retryCount: attemptCount,
                metadata: {
                    invoiceUrl: inv.hosted_invoice_url,
                    nextPaymentAttempt: inv.next_payment_attempt,
                },
            };
        });
}

// Detect leaks from past due subscriptions
export function detectPastDueSubscriptions(subscriptions: Stripe.Subscription[]): DetectedLeak[] {
    return subscriptions
        .filter(sub => sub.status === 'past_due' || sub.status === 'unpaid')
        .map(sub => {
            const s = sub as any; // Cast for snake_case properties
            const customer = sub.customer as Stripe.Customer;
            const latestInvoice = sub.latest_invoice as Stripe.Invoice | null;

            return {
                id: `leak_${sub.id}`,
                type: 'subscription_past_due' as LeakType,
                priority: 'critical' as LeakPriority,
                title: 'Subscription Past Due',
                description: `Subscription is ${sub.status} and at risk of cancellation`,
                customerId: customer?.id || '',
                customerEmail: customer?.email || 'unknown',
                customerName: customer?.name || customer?.email || 'Unknown Customer',
                subscriptionId: sub.id,
                invoiceId: typeof latestInvoice === 'string' ? latestInvoice : latestInvoice?.id,
                amount: (sub.items.data[0]?.price?.unit_amount || 0) / 100,
                currency: sub.currency.toUpperCase(),
                detectedAt: new Date((s.current_period_start || 0) * 1000),
                interventionWindowHours: calculateInterventionWindow(
                    'subscription_past_due',
                    new Date((s.current_period_start || 0) * 1000)
                ),
                failureReason: `Status: ${sub.status}`,
                metadata: {
                    currentPeriodEnd: s.current_period_end,
                    cancelAtPeriodEnd: s.cancel_at_period_end,
                },
            };
        });
}

// Detect expiring cards
export function detectExpiringCards(subscriptions: Stripe.Subscription[]): DetectedLeak[] {
    const now = new Date();
    const leaks: DetectedLeak[] = [];

    for (const sub of subscriptions) {
        if (sub.status !== 'active') continue;

        const pm = sub.default_payment_method as Stripe.PaymentMethod | null;
        if (!pm?.card) continue;

        const expMonth = pm.card.exp_month;
        const expYear = pm.card.exp_year;
        const expDate = new Date(expYear, expMonth, 0); // Last day of exp month
        const daysUntilExpiry = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
            // Card already expired
            const customer = sub.customer as Stripe.Customer;
            leaks.push({
                id: `leak_exp_${sub.id}`,
                type: 'card_expired',
                priority: 'critical',
                title: 'Card Expired',
                description: `Payment method expired ${Math.abs(daysUntilExpiry)} days ago`,
                customerId: customer?.id || '',
                customerEmail: customer?.email || 'unknown',
                customerName: customer?.name || customer?.email || 'Unknown Customer',
                subscriptionId: sub.id,
                amount: (sub.items.data[0]?.price?.unit_amount || 0) / 100,
                currency: sub.currency.toUpperCase(),
                detectedAt: now,
                interventionWindowHours: 48,
                failureReason: `Card ending in ${pm.card.last4} expired ${expMonth}/${expYear}`,
                metadata: {
                    cardLast4: pm.card.last4,
                    cardBrand: pm.card.brand,
                    expMonth,
                    expYear,
                },
            });
        } else if (daysUntilExpiry <= 30) {
            // Card expiring soon
            const customer = sub.customer as Stripe.Customer;
            leaks.push({
                id: `leak_expiring_${sub.id}`,
                type: 'card_expiring',
                priority: daysUntilExpiry <= 7 ? 'critical' : 'warning',
                title: 'Card Expiring Soon',
                description: `Payment method expires in ${daysUntilExpiry} days`,
                customerId: customer?.id || '',
                customerEmail: customer?.email || 'unknown',
                customerName: customer?.name || customer?.email || 'Unknown Customer',
                subscriptionId: sub.id,
                amount: (sub.items.data[0]?.price?.unit_amount || 0) / 100,
                currency: sub.currency.toUpperCase(),
                detectedAt: now,
                interventionWindowHours: daysUntilExpiry * 24,
                metadata: {
                    cardLast4: pm.card.last4,
                    cardBrand: pm.card.brand,
                    expMonth,
                    expYear,
                },
            });
        }
    }

    return leaks;
}

// Detect recoverable cancellations (recently canceled, could be won back)
export function detectRecoverableCancellations(subscriptions: Stripe.Subscription[]): DetectedLeak[] {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return subscriptions
        .filter(sub => {
            if (sub.status !== 'canceled') return false;
            const canceledAt = new Date((sub.canceled_at || 0) * 1000);
            return canceledAt >= twoDaysAgo;
        })
        .map(sub => {
            const customer = sub.customer as Stripe.Customer;
            const canceledAt = new Date((sub.canceled_at || 0) * 1000);
            const hoursRemaining = 48 - (now.getTime() - canceledAt.getTime()) / (1000 * 60 * 60);

            return {
                id: `leak_cancel_${sub.id}`,
                type: 'canceled_recoverable' as LeakType,
                priority: 'warning' as LeakPriority,
                title: 'Recent Cancellation',
                description: 'Recently canceled subscription may be recoverable',
                customerId: customer?.id || '',
                customerEmail: customer?.email || 'unknown',
                customerName: customer?.name || customer?.email || 'Unknown Customer',
                subscriptionId: sub.id,
                amount: (sub.items.data[0]?.price?.unit_amount || 0) / 100,
                currency: sub.currency.toUpperCase(),
                detectedAt: canceledAt,
                interventionWindowHours: Math.max(0, hoursRemaining),
                metadata: {
                    cancelReason: sub.cancellation_details?.reason,
                    cancelFeedback: sub.cancellation_details?.feedback,
                },
            };
        });
}

// Main detection function - runs all detectors
export async function runLeakDetection(
    subscriptions: Stripe.Subscription[],
    invoices: Stripe.Invoice[]
): Promise<DetectedLeak[]> {
    const allLeaks: DetectedLeak[] = [];

    // Run all detectors
    allLeaks.push(...detectPaymentFailures(invoices));
    allLeaks.push(...detectPastDueSubscriptions(subscriptions));
    allLeaks.push(...detectExpiringCards(subscriptions));
    allLeaks.push(...detectRecoverableCancellations(subscriptions));

    // Sort by priority and intervention window
    return allLeaks.sort((a, b) => {
        const priorityOrder = { critical: 0, warning: 1, info: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.interventionWindowHours - b.interventionWindowHours;
    });
}

// Calculate total revenue at risk
export function calculateRevenueAtRisk(leaks: DetectedLeak[]): number {
    return leaks
        .filter(leak => leak.priority === 'critical' || leak.priority === 'warning')
        .reduce((total, leak) => total + leak.amount, 0);
}
