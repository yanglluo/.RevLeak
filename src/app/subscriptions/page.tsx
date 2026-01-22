'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    CreditCard,
    Search,
    RefreshCw,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Subscription {
    id: string;
    stripeId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    paymentMethodLast4?: string;
    paymentMethodBrand?: string;
    healthScore: 'healthy' | 'at_risk' | 'critical';
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
        active: 'badge-success',
        past_due: 'badge-danger',
        unpaid: 'badge-danger',
        canceled: 'badge-neutral',
        incomplete: 'badge-warning',
        trialing: 'badge-info',
    };
    return styles[status] || 'badge-neutral';
}

function SubscriptionsContent() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'healthy' | 'at_risk' | 'critical'>('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const result = await res.json();
            if (result.success) {
                setSubscriptions(result.data.subscriptions);
                toast.success(`Loaded ${result.data.subscriptions.length} subscriptions`);
            }
        } catch (error) {
            toast.error('Failed to load subscriptions');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate stats
    const totalMRR = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0);

    const atRiskCount = subscriptions.filter(s => s.healthScore === 'at_risk' || s.healthScore === 'critical').length;

    // Filter subscriptions
    const filteredSubs = subscriptions.filter(sub => {
        const matchesSearch = !searchQuery ||
            sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || sub.healthScore === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout
            title="Subscriptions"
            subtitle={`${subscriptions.length} active subscriptions • ${formatCurrency(totalMRR)} MRR`}
            actions={
                <button
                    className="btn btn-primary"
                    onClick={fetchData}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh
                </button>
            }
        >
            <Toaster position="top-right" toastOptions={{
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
            }} />

            {/* Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card">
                    <div className="stat-card-label">Total MRR</div>
                    <div className="stat-card-value">{formatCurrency(totalMRR)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Active Subscriptions</div>
                    <div className="stat-card-value">{subscriptions.filter(s => s.status === 'active').length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">At Risk</div>
                    <div className="stat-card-value text-warning">{atRiskCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Avg. Subscription</div>
                    <div className="stat-card-value">
                        {formatCurrency(subscriptions.length > 0 ? totalMRR / subscriptions.filter(s => s.status === 'active').length : 0)}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4) var(--space-3) 40px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-sm)',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {(['all', 'healthy', 'at_risk', 'critical'] as const).map((f) => (
                        <button
                            key={f}
                            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                    <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Period End</th>
                                <th>Health</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubs.map((sub) => (
                                <tr key={sub.id}>
                                    <td>
                                        <div className="font-medium">{sub.customerName}</div>
                                        <div className="text-sm text-muted">{sub.customerEmail}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="font-semibold">{formatCurrency(sub.amount, sub.currency)}</div>
                                        <div className="text-xs text-muted">per {sub.interval}</div>
                                    </td>
                                    <td>
                                        {sub.paymentMethodLast4 ? (
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={16} className="text-muted" />
                                                <span>•••• {sub.paymentMethodLast4}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-muted" />
                                            {formatDate(sub.currentPeriodEnd)}
                                        </div>
                                        {sub.cancelAtPeriodEnd && (
                                            <div className="text-xs text-danger mt-1">Cancels at period end</div>
                                        )}
                                    </td>
                                    <td>
                                        {sub.healthScore === 'healthy' ? (
                                            <CheckCircle2 size={18} className="text-success" />
                                        ) : sub.healthScore === 'critical' ? (
                                            <AlertTriangle size={18} className="text-danger" />
                                        ) : (
                                            <AlertTriangle size={18} className="text-warning" />
                                        )}
                                    </td>
                                    <td>
                                        <a
                                            href={`https://dashboard.stripe.com/subscriptions/${sub.stripeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <ArrowUpRight size={14} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}

// Protected Subscriptions Page - requires authentication
export default function SubscriptionsPage() {
    return (
        <ProtectedRoute requirePayment={false}>
            <SubscriptionsContent />
        </ProtectedRoute>
    );
}
