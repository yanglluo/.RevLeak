import Stripe from 'stripe';

// Use a dummy test key format when not configured (prevents SDK initialization errors)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_unconfigured_placeholder_key_00000000000000';

// Lazy-initialize Stripe to prevent build errors when API key is not set
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeClient) {
        stripeClient = new Stripe(STRIPE_KEY, {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        });
    }
    return stripeClient;
}

// Legacy export for compatibility
export const stripe = {
    get accounts() { return getStripe().accounts; },
    get subscriptions() { return getStripe().subscriptions; },
    get customers() { return getStripe().customers; },
    get invoices() { return getStripe().invoices; },
    get paymentIntents() { return getStripe().paymentIntents; },
    get billingPortal() { return getStripe().billingPortal; },
    get webhooks() { return getStripe().webhooks; },
};

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_');
}

// Fetch all subscriptions with pagination
export async function fetchAllSubscriptions(limit = 100): Promise<Stripe.Subscription[]> {
    const subscriptions: Stripe.Subscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
        const response = await stripe.subscriptions.list({
            limit,
            starting_after: startingAfter,
            expand: ['data.customer', 'data.default_payment_method'],
        });

        subscriptions.push(...response.data);
        hasMore = response.has_more;

        if (response.data.length > 0) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }

    return subscriptions;
}

// Fetch all customers with pagination
export async function fetchAllCustomers(limit = 100): Promise<Stripe.Customer[]> {
    const customers: Stripe.Customer[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
        const response = await stripe.customers.list({
            limit,
            starting_after: startingAfter,
            expand: ['data.default_source'],
        });

        customers.push(...response.data);
        hasMore = response.has_more;

        if (response.data.length > 0) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }

    return customers;
}

// Fetch failed invoices
export async function fetchFailedInvoices(limit = 100): Promise<Stripe.Invoice[]> {
    const invoices: Stripe.Invoice[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
        const response = await stripe.invoices.list({
            limit,
            starting_after: startingAfter,
            status: 'open',
            expand: ['data.customer', 'data.subscription'],
        });

        // Filter for past_due invoices
        const failedInvoices = response.data.filter(
            (inv) => inv.attempted && inv.status !== 'paid'
        );
        invoices.push(...failedInvoices);
        hasMore = response.has_more;

        if (response.data.length > 0) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }

    return invoices;
}

// Fetch payment intents that failed
export async function fetchFailedPayments(limit = 100): Promise<Stripe.PaymentIntent[]> {
    const payments: Stripe.PaymentIntent[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
        const response = await stripe.paymentIntents.list({
            limit,
            starting_after: startingAfter,
        });

        // Filter for requires_action or requires_payment_method
        const failed = response.data.filter(
            (pi) =>
                pi.status === 'requires_action' ||
                pi.status === 'requires_payment_method'
        );
        payments.push(...failed);
        hasMore = response.has_more;

        if (response.data.length > 0) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }

    return payments;
}

// Get subscription health status
export function getSubscriptionHealth(sub: Stripe.Subscription): 'healthy' | 'at_risk' | 'critical' {
    if (sub.status === 'past_due') return 'critical';
    if (sub.status === 'unpaid') return 'critical';
    if (sub.status === 'incomplete') return 'at_risk';
    if (sub.status === 'incomplete_expired') return 'critical';

    // Check if card is expiring soon
    const paymentMethod = sub.default_payment_method as Stripe.PaymentMethod | null;
    if (paymentMethod?.card) {
        const now = new Date();
        const expMonth = paymentMethod.card.exp_month;
        const expYear = paymentMethod.card.exp_year;
        const expDate = new Date(expYear, expMonth - 1);
        const daysUntilExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (daysUntilExpiry < 0) return 'critical';
        if (daysUntilExpiry < 30) return 'at_risk';
    }

    return 'healthy';
}
