// Type definitions for RevLeak V5

export interface User {
    id: string;
    email: string;
    name?: string;
    stripeConnected: boolean;
    createdAt: Date;
}

export interface StripeConnection {
    id: string;
    userId: string;
    stripeAccountId?: string;
    lastSyncAt?: Date;
    syncStatus: 'idle' | 'syncing' | 'error';
    errorMessage?: string;
}

export interface Leak {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId?: string;
    stripeInvoiceId?: string;
    type: LeakType;
    priority: LeakPriority;
    status: LeakStatus;
    title: string;
    description: string;
    customerEmail: string;
    customerName: string;
    amountAtRisk: number;
    currency: string;
    interventionWindowHours: number;
    failureReason?: string;
    retryCount: number;
    detectedAt: Date;
    resolvedAt?: Date;
    resolutionType?: ResolutionType;
    metadata: Record<string, unknown>;
}

export type LeakType =
    | 'payment_failed'
    | 'subscription_past_due'
    | 'card_expiring'
    | 'card_expired'
    | 'disputed'
    | 'canceled_recoverable';

export type LeakPriority = 'critical' | 'warning' | 'info';

export type LeakStatus = 'active' | 'resolved' | 'dismissed' | 'expired';

export type ResolutionType =
    | 'payment_recovered'
    | 'card_updated'
    | 'subscription_resumed'
    | 'manually_resolved'
    | 'auto_expired';

export interface DashboardStats {
    revenueAtRisk: number;
    revenueSaved: number;
    activeLeaks: number;
    resolvedLeaks: number;
    detectionRate: number;
    avgResolutionTime: number; // in hours
}

export interface Customer {
    id: string;
    stripeId: string;
    email: string;
    name: string;
    subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'none';
    mrr: number;
    currency: string;
    healthScore: 'healthy' | 'at_risk' | 'critical';
    lastPaymentAt?: Date;
    createdAt: Date;
}

export interface Subscription {
    id: string;
    stripeId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    status: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    paymentMethodLast4?: string;
    paymentMethodBrand?: string;
    healthScore: 'healthy' | 'at_risk' | 'critical';
}

export interface Alert {
    id: string;
    userId: string;
    leakId: string;
    type: 'email' | 'slack' | 'webhook';
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    errorMessage?: string;
}

export interface Settings {
    userId: string;
    alertEmail: string;
    emailNotifications: boolean;
    slackWebhook?: string;
    autoRetryEnabled: boolean;
    interventionThresholdHours: number;
}
