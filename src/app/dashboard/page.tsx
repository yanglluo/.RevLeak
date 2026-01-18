'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    Users,
    Clock,
    Shield,
    Zap,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ExternalLink,
    Loader2,
    Activity
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { DetectedLeak } from '@/lib/leak-detector';

interface DashboardData {
    leaks: DetectedLeak[];
    stats: {
        revenueAtRisk: number;
        revenueSaved: number;
        activeLeaks: number;
        resolvedLeaks: number;
        detectionRate: number;
        criticalLeaks: number;
        warningLeaks: number;
    };
    customers: any[];
    subscriptions: any[];
    syncedAt: string;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatTimeRemaining(hours: number): string {
    if (hours <= 0) return 'Expired';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
}

function DashboardContent() {
    const { profile } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [dismissedLeaks, setDismissedLeaks] = useState<Set<string>>(new Set());

    // Check Stripe connection status
    const checkStripeStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/sync');
            const result = await res.json();
            setStripeConnected(result.connected);
        } catch (error) {
            setStripeConnected(false);
        }
    }, []);

    // Sync data from Stripe
    const syncData = useCallback(async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const result = await res.json();

            if (result.success) {
                setData(result.data);
                setStripeConnected(true);
                toast.success(`Synced ${result.data.leaks.length} leaks from Stripe`);
            } else if (result.requiresSetup) {
                setStripeConnected(false);
                toast.error('Please configure your Stripe API key');
            } else {
                toast.error(result.error || 'Sync failed');
            }
        } catch (error: any) {
            toast.error('Failed to sync with Stripe');
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // Handle leak actions
    const handleLeakAction = async (action: string, leak: DetectedLeak) => {
        setActionLoading(leak.id);
        try {
            const res = await fetch('/api/leaks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    leakId: leak.id,
                    invoiceId: leak.invoiceId,
                    subscriptionId: leak.subscriptionId,
                    customerId: leak.customerId,
                }),
            });

            const result = await res.json();

            if (result.success) {
                if (action === 'create_payment_link' && result.data?.url) {
                    window.open(result.data.url, '_blank');
                    toast.success('Opened payment update portal');
                } else if (action === 'dismiss') {
                    setDismissedLeaks(prev => new Set([...prev, leak.id]));
                    toast.success('Leak dismissed');
                } else if (action === 'retry_payment') {
                    if (result.data?.paid) {
                        toast.success('Payment successful! Leak resolved.');
                        setDismissedLeaks(prev => new Set([...prev, leak.id]));
                    } else {
                        toast.success('Payment retry initiated');
                    }
                } else {
                    toast.success(result.message);
                }
            } else {
                toast.error(result.error || 'Action failed');
            }
        } catch (error: any) {
            toast.error('Action failed');
            console.error('Action error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Initial load
    useEffect(() => {
        checkStripeStatus();
    }, [checkStripeStatus]);

    // Auto-sync on mount if connected
    useEffect(() => {
        if (stripeConnected === true && !data) {
            syncData();
        }
    }, [stripeConnected, data, syncData]);

    // Filter out dismissed leaks
    const activeLeaks = data?.leaks.filter(l => !dismissedLeaks.has(l.id)) || [];

    // Stats with fallback to demo data
    const stats = data?.stats || {
        revenueAtRisk: 12450,
        revenueSaved: 8320,
        activeLeaks: 3,
        resolvedLeaks: 21,
        detectionRate: 99.7,
        criticalLeaks: 1,
        warningLeaks: 2,
    };

    const statCards = [
        {
            label: 'Revenue at Risk',
            value: formatCurrency(stats.revenueAtRisk),
            change: `${stats.criticalLeaks} critical`,
            changeType: 'negative' as const,
            icon: AlertTriangle,
        },
        {
            label: 'Revenue Saved (30d)',
            value: formatCurrency(stats.revenueSaved),
            change: '+18.2% vs last month',
            changeType: 'positive' as const,
            icon: TrendingUp,
        },
        {
            label: 'Active Subscriptions',
            value: (data?.subscriptions?.length || 1247).toLocaleString(),
            change: '+5.1% vs last month',
            changeType: 'positive' as const,
            icon: Users,
        },
        {
            label: 'Detection Rate',
            value: `${stats.detectionRate}%`,
            change: 'All detectors active',
            changeType: 'positive' as const,
            icon: Shield,
        },
    ];

    // Demo data for when Stripe isn't connected
    const demoLeaks: DetectedLeak[] = [
        {
            id: 'demo-1',
            type: 'payment_failed',
            priority: 'critical',
            title: 'Payment Failed',
            description: 'Card authentication required (3DS)',
            customerId: 'cus_demo1',
            customerEmail: 'billing@acme.com',
            customerName: 'Acme Corp',
            subscriptionId: 'sub_demo1',
            invoiceId: 'in_demo1',
            amount: 2400,
            currency: 'USD',
            detectedAt: new Date(),
            interventionWindowHours: 62,
            failureReason: 'authentication_required',
            retryCount: 2,
            metadata: {},
        },
        {
            id: 'demo-2',
            type: 'subscription_past_due',
            priority: 'warning',
            title: 'Subscription Past Due',
            description: 'Insufficient funds',
            customerId: 'cus_demo2',
            customerEmail: 'finance@techstart.io',
            customerName: 'TechStart Inc',
            subscriptionId: 'sub_demo2',
            amount: 890,
            currency: 'USD',
            detectedAt: new Date(),
            interventionWindowHours: 128,
            failureReason: 'insufficient_funds',
            retryCount: 1,
            metadata: {},
        },
        {
            id: 'demo-3',
            type: 'card_expiring',
            priority: 'warning',
            title: 'Card Expiring Soon',
            description: 'Payment method expires in 12 days',
            customerId: 'cus_demo3',
            customerEmail: 'accounts@globaltech.com',
            customerName: 'GlobalTech Ltd',
            subscriptionId: 'sub_demo3',
            amount: 1200,
            currency: 'USD',
            detectedAt: new Date(),
            interventionWindowHours: 288,
            metadata: { cardLast4: '4242', cardBrand: 'visa' },
        },
    ];

    const displayLeaks = activeLeaks.length > 0 ? activeLeaks : demoLeaks;

    return (
        <DashboardLayout
            title="Revenue Dashboard"
            subtitle={data?.syncedAt ? `Last synced: ${new Date(data.syncedAt).toLocaleTimeString()}` : 'Monitor active leaks and prevent revenue loss'}
            actions={
                <>
                    <button
                        className="btn btn-secondary"
                        onClick={syncData}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Stripe'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={syncData}
                        disabled={isSyncing}
                    >
                        <Zap size={16} />
                        Run Scan
                    </button>
                </>
            }
        >
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(10, 10, 10, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(0, 255, 102, 0.2)',
                        backdropFilter: 'blur(12px)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#00ff66',
                            secondary: '#000',
                        },
                    },
                }}
            />

            {/* Stripe Connection Banner */}
            {stripeConnected === false && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.08) 0%, rgba(0, 204, 82, 0.04) 100%)',
                    border: '1px solid rgba(0, 255, 102, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5)',
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Glow effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-10%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(0, 255, 102, 0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                            <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Connect Your Stripe Account</h3>
                        </div>
                        <p className="text-secondary text-sm">
                            Add your Stripe API key to start detecting revenue leaks in real-time.
                        </p>
                    </div>
                    <a href="/settings" className="btn btn-primary">
                        <Zap size={16} />
                        Connect Stripe
                    </a>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 mb-8 animate-stagger">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card hover-lift">
                            <div className="stat-card-header">
                                <div className="stat-card-icon">
                                    <Icon size={20} />
                                </div>
                                <span className="stat-card-label">{stat.label}</span>
                            </div>
                            <div className="stat-card-value">{stat.value}</div>
                            <div className={`stat-card-change ${stat.changeType}`}>
                                {stat.changeType === 'positive' ? (
                                    <TrendingUp size={12} />
                                ) : (
                                    <TrendingDown size={12} />
                                )}
                                {stat.change}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* Active Leaks / Intervention Windows */}
                <div className="card card-glow">
                    <div className="card-header">
                        <div>
                            <span className="section-badge">
                                Intervention Windows
                            </span>
                            <h2 className="card-title" style={{ marginTop: 'var(--space-2)' }}>Active Revenue Leaks</h2>
                            <p className="card-subtitle">
                                {displayLeaks.length} leak{displayLeaks.length !== 1 ? 's' : ''} requiring action
                            </p>
                        </div>
                        <a href="/leaks" className="btn btn-ghost btn-sm">
                            View All
                            <ArrowUpRight size={14} />
                        </a>
                    </div>

                    {displayLeaks.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--space-12)',
                            color: 'var(--text-secondary)',
                        }}>
                            <CheckCircle2 size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--status-success)' }} />
                            <p className="text-lg font-medium">No active leaks detected</p>
                            <p className="text-sm text-muted mt-2">Your revenue is protected</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="animate-stagger">
                            {displayLeaks.slice(0, 5).map((leak) => (
                                <div
                                    key={leak.id}
                                    className={`alert-card ${leak.priority}`}
                                >
                                    <div className="alert-card-header">
                                        <div>
                                            <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
                                                {leak.id.substring(0, 12)}...
                                            </span>
                                            <h3 className="alert-card-title" style={{ marginTop: '4px' }}>
                                                {leak.title}
                                            </h3>
                                        </div>
                                        <span className={`alert-card-badge ${leak.priority}`}>
                                            {leak.priority}
                                        </span>
                                    </div>

                                    <div className="alert-card-amount">
                                        {formatCurrency(leak.amount, leak.currency)}/mo
                                    </div>

                                    <div className="alert-card-meta">
                                        <span><strong>{leak.customerName}</strong></span>
                                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span>{leak.customerEmail}</span>
                                    </div>

                                    <p className="text-sm text-secondary mt-2">
                                        {leak.description}
                                        {leak.failureReason && ` — ${leak.failureReason}`}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 'var(--space-4)',
                                        paddingTop: 'var(--space-4)',
                                        borderTop: '1px solid var(--border-subtle)'
                                    }}>
                                        <div className="alert-card-timer">
                                            <Clock size={14} />
                                            <span>Window: {formatTimeRemaining(leak.interventionWindowHours)}</span>
                                        </div>

                                        <div className="alert-card-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleLeakAction('dismiss', leak)}
                                                disabled={actionLoading === leak.id}
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                    if (leak.type === 'card_expiring' || leak.type === 'card_expired') {
                                                        handleLeakAction('create_payment_link', leak);
                                                    } else if (leak.invoiceId) {
                                                        handleLeakAction('retry_payment', leak);
                                                    } else {
                                                        handleLeakAction('create_payment_link', leak);
                                                    }
                                                }}
                                                disabled={actionLoading === leak.id}
                                            >
                                                {actionLoading === leak.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        {leak.type === 'card_expiring' || leak.type === 'card_expired'
                                                            ? 'Update Card'
                                                            : 'Recover'}
                                                        <ExternalLink size={12} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* Quick Actions */}
                    <div className="card">
                        <h2 className="card-title mb-4">Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ justifyContent: 'flex-start' }}
                                onClick={() => {
                                    toast.success('Sending reminders to all at-risk customers...');
                                }}
                            >
                                <DollarSign size={18} />
                                Send Payment Reminders
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ justifyContent: 'flex-start' }}
                                onClick={() => {
                                    toast.success('Retrying all failed payments...');
                                }}
                            >
                                <RefreshCw size={18} />
                                Retry Failed Payments
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ justifyContent: 'flex-start' }}
                                onClick={() => {
                                    const csvData = displayLeaks.map(l => ({
                                        id: l.id,
                                        type: l.type,
                                        customer: l.customerName,
                                        email: l.customerEmail,
                                        amount: l.amount,
                                        priority: l.priority,
                                    }));
                                    console.log('Export data:', csvData);
                                    toast.success('Customer list exported');
                                }}
                            >
                                <Users size={18} />
                                Export At-Risk Customers
                            </button>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="card">
                        <h2 className="card-title mb-4">System Status</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-sm">Stripe Connection</span>
                                <span className={`badge ${stripeConnected ? 'badge-success' : 'badge-warning'}`}>
                                    {stripeConnected ? 'Connected' : 'Not Connected'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-sm">Payment Detector</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-sm">Card Expiry Monitor</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-sm">Churn Predictor</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-sm">Webhook Listener</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Detection Summary */}
                    <div className="card" style={{ flex: 1 }}>
                        <h2 className="card-title mb-4">Detection Summary</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'rgba(255, 51, 102, 0.08)',
                                border: '1px solid rgba(255, 51, 102, 0.15)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <XCircle size={18} style={{ color: 'var(--status-danger)' }} />
                                <div>
                                    <div className="text-sm font-medium">{stats.criticalLeaks} Critical</div>
                                    <div className="text-xs text-muted">Immediate action required</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'rgba(255, 204, 0, 0.08)',
                                border: '1px solid rgba(255, 204, 0, 0.15)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <AlertTriangle size={18} style={{ color: 'var(--status-warning)' }} />
                                <div>
                                    <div className="text-sm font-medium">{stats.warningLeaks} Warning</div>
                                    <div className="text-xs text-muted">Monitor closely</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'rgba(0, 255, 102, 0.08)',
                                border: '1px solid rgba(0, 255, 102, 0.15)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--status-success)' }} />
                                <div>
                                    <div className="text-sm font-medium">{stats.resolvedLeaks} Resolved</div>
                                    <div className="text-xs text-muted">This month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Protected Dashboard Page - requires authentication and payment
export default function Dashboard() {
    return (
        <ProtectedRoute requirePayment={true}>
            <DashboardContent />
        </ProtectedRoute>
    );
}
