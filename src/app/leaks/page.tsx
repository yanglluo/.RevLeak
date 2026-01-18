'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    AlertTriangle,
    Clock,
    ExternalLink,
    Filter,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { DetectedLeak } from '@/lib/leak-detector';

function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatTimeRemaining(hours: number): string {
    if (hours <= 0) return 'Expired';
    if (hours < 24) return `${Math.round(hours)}h remaining`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h remaining`;
}

function getLeakTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        payment_failed: 'Payment Failed',
        subscription_past_due: 'Past Due',
        card_expiring: 'Card Expiring',
        card_expired: 'Card Expired',
        disputed: 'Disputed',
        canceled_recoverable: 'Recoverable',
    };
    return labels[type] || type;
}

export default function LeaksPage() {
    const [leaks, setLeaks] = useState<DetectedLeak[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLeaks = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const result = await res.json();
            if (result.success) {
                setLeaks(result.data.leaks);
            }
        } catch (error) {
            console.error('Failed to fetch leaks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaks();
    }, [fetchLeaks]);

    const handleAction = async (action: string, leak: DetectedLeak) => {
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
                    toast.success('Opened customer billing portal');
                } else if (action === 'dismiss' || action === 'resolve') {
                    setLeaks(prev => prev.filter(l => l.id !== leak.id));
                    toast.success(action === 'dismiss' ? 'Leak dismissed' : 'Leak resolved');
                } else if (action === 'retry_payment') {
                    if (result.data?.paid) {
                        setLeaks(prev => prev.filter(l => l.id !== leak.id));
                        toast.success('Payment successful!');
                    } else {
                        toast.success('Payment retry initiated');
                    }
                } else {
                    toast.success(result.message);
                }
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    // Filter and search leaks
    const filteredLeaks = leaks.filter(leak => {
        const matchesFilter = filter === 'all' || leak.priority === filter;
        const matchesSearch = !searchQuery ||
            leak.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            leak.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const criticalCount = leaks.filter(l => l.priority === 'critical').length;
    const warningCount = leaks.filter(l => l.priority === 'warning').length;
    const totalAtRisk = leaks.reduce((sum, l) => sum + l.amount, 0);

    return (
        <DashboardLayout
            title="Active Leaks"
            subtitle={`${leaks.length} intervention windows open • ${formatCurrency(totalAtRisk)}/mo at risk`}
            actions={
                <button
                    className="btn btn-primary"
                    onClick={fetchLeaks}
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

            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
            }}>
                {/* Search */}
                <div style={{
                    flex: 1,
                    minWidth: '300px',
                    position: 'relative',
                }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                    }} />
                    <input
                        type="text"
                        placeholder="Search by customer name or email..."
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

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({leaks.length})
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('critical')}
                    >
                        <XCircle size={14} />
                        Critical ({criticalCount})
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('warning')}
                    >
                        <AlertTriangle size={14} />
                        Warning ({warningCount})
                    </button>
                </div>
            </div>

            {/* Leaks List */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                    <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                    <p className="text-secondary mt-4">Scanning for revenue leaks...</p>
                </div>
            ) : filteredLeaks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                    <CheckCircle2 size={64} style={{ margin: '0 auto', color: 'var(--status-success)' }} />
                    <h3 className="text-xl font-semibold mt-4">No Active Leaks</h3>
                    <p className="text-secondary mt-2">
                        {searchQuery || filter !== 'all'
                            ? 'No leaks match your current filters'
                            : 'Your revenue is fully protected'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {filteredLeaks.map((leak) => (
                        <div key={leak.id} className={`alert-card ${leak.priority}`}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)' }}>
                                {/* Left Side - Leak Info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                                        <span className={`badge badge-${leak.priority === 'critical' ? 'danger' : 'warning'}`}>
                                            {getLeakTypeLabel(leak.type)}
                                        </span>
                                        <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                                            {leak.id.substring(0, 16)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold">{leak.customerName}</h3>
                                    <p className="text-sm text-secondary">{leak.customerEmail}</p>

                                    <p className="text-sm mt-3">
                                        {leak.description}
                                        {leak.failureReason && (
                                            <span className="text-muted"> — {leak.failureReason}</span>
                                        )}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                                        <div className="alert-card-timer">
                                            <Clock size={14} />
                                            <span>{formatTimeRemaining(leak.interventionWindowHours)}</span>
                                        </div>
                                        {leak.retryCount !== undefined && leak.retryCount > 0 && (
                                            <span className="text-xs text-muted">
                                                {leak.retryCount} retry attempt{leak.retryCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side - Amount & Actions */}
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="text-2xl font-bold text-accent">
                                            {formatCurrency(leak.amount, leak.currency)}
                                        </div>
                                        <div className="text-sm text-muted">per month</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleAction('dismiss', leak)}
                                            disabled={actionLoading === leak.id}
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleAction('create_payment_link', leak)}
                                            disabled={actionLoading === leak.id}
                                        >
                                            <ExternalLink size={14} />
                                            Customer Portal
                                        </button>
                                        {leak.invoiceId && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleAction('retry_payment', leak)}
                                                disabled={actionLoading === leak.id}
                                            >
                                                {actionLoading === leak.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <RefreshCw size={14} />
                                                        Retry Payment
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
