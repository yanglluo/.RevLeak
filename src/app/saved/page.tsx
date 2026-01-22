'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    TrendingUp,
    DollarSign,
    CheckCircle2,
    RefreshCw,
    Loader2,
    ArrowUpRight,
    Calendar
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ResolvedLeak {
    id: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    type: string;
    resolvedAt: Date;
    resolutionType: string;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Demo data for resolved leaks
const demoResolved: ResolvedLeak[] = [
    {
        id: '1',
        customerName: 'StartupXYZ',
        customerEmail: 'billing@startupxyz.com',
        amount: 450,
        type: 'payment_failed',
        resolvedAt: new Date(Date.now() - 2 * 60 * 1000),
        resolutionType: 'payment_recovered',
    },
    {
        id: '2',
        customerName: 'DevShop Co',
        customerEmail: 'accounts@devshop.co',
        amount: 675,
        type: 'card_expiring',
        resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        resolutionType: 'card_updated',
    },
    {
        id: '3',
        customerName: 'CloudBase Inc',
        customerEmail: 'finance@cloudbase.io',
        amount: 1250,
        type: 'subscription_past_due',
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolutionType: 'payment_recovered',
    },
    {
        id: '4',
        customerName: 'DataFlow Ltd',
        customerEmail: 'billing@dataflow.com',
        amount: 890,
        type: 'payment_failed',
        resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        resolutionType: 'payment_recovered',
    },
    {
        id: '5',
        customerName: 'TechMerge',
        customerEmail: 'accounts@techmerge.io',
        amount: 2100,
        type: 'card_expired',
        resolvedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        resolutionType: 'card_updated',
    },
];

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function RevenueSavedContent() {
    const [resolvedLeaks, setResolvedLeaks] = useState<ResolvedLeak[]>(demoResolved);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const totalSaved = resolvedLeaks.reduce((sum, leak) => sum + leak.amount, 0);
    const avgRecoveryTime = '1.8 days';

    return (
        <DashboardLayout
            title="Revenue Saved"
            subtitle="Track recovered revenue from prevented leaks"
            actions={
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
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

            {/* Hero Stats */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.12) 0%, rgba(0, 204, 82, 0.04) 100%)',
                border: '1px solid rgba(0, 255, 102, 0.25)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-10)',
                textAlign: 'center',
                marginBottom: 'var(--space-8)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Glow effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(0, 255, 102, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="text-sm text-secondary mb-2">Total Revenue Saved</div>
                    <div style={{
                        fontSize: 'var(--text-5xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--accent-primary)',
                        letterSpacing: '-0.03em',
                        textShadow: '0 0 40px rgba(0, 255, 102, 0.3)',
                    }}>
                        {formatCurrency(totalSaved)}
                    </div>
                    <div className="text-sm text-secondary mt-2">
                        From {resolvedLeaks.length} recovered leaks in the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 mb-8">
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ marginBottom: 'var(--space-3)' }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-card-label">Leaks Resolved</div>
                    <div className="stat-card-value">{resolvedLeaks.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ marginBottom: 'var(--space-3)' }}>
                        <DollarSign size={20} />
                    </div>
                    <div className="stat-card-label">Avg. Recovered</div>
                    <div className="stat-card-value">
                        {formatCurrency(resolvedLeaks.length > 0 ? totalSaved / resolvedLeaks.length : 0)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ marginBottom: 'var(--space-3)' }}>
                        <Calendar size={20} />
                    </div>
                    <div className="stat-card-label">Avg. Resolution Time</div>
                    <div className="stat-card-value">{avgRecoveryTime}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ marginBottom: 'var(--space-3)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-card-label">Recovery Rate</div>
                    <div className="stat-card-value">87.5%</div>
                </div>
            </div>

            {/* Resolved Leaks List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recently Resolved</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Leak Type</th>
                                <th>Resolution</th>
                                <th>Amount Saved</th>
                                <th>Resolved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolvedLeaks.map((leak) => (
                                <tr key={leak.id}>
                                    <td>
                                        <div className="font-medium">{leak.customerName}</div>
                                        <div className="text-sm text-muted">{leak.customerEmail}</div>
                                    </td>
                                    <td>
                                        <span className="badge badge-neutral">
                                            {leak.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-success" />
                                            <span className="text-sm">
                                                {leak.resolutionType === 'payment_recovered' ? 'Payment Recovered' : 'Card Updated'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-semibold text-accent">
                                            {formatCurrency(leak.amount)}/mo
                                        </span>
                                    </td>
                                    <td className="text-muted">
                                        {formatTimeAgo(leak.resolvedAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Protected Revenue Saved Page - requires authentication
export default function RevenueSavedPage() {
    return (
        <ProtectedRoute requirePayment={false}>
            <RevenueSavedContent />
        </ProtectedRoute>
    );
}
