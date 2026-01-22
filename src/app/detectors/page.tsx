'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Shield,
    CreditCard,
    Clock,
    AlertTriangle,
    XCircle,
    TrendingDown,
    CheckCircle2,
    Settings,
    Zap,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Detector {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
    detectedCount: number;
    resolvedCount: number;
    amountProtected: number;
    lastTriggered?: Date;
}

const initialDetectors: Detector[] = [
    {
        id: 'payment_failed',
        name: 'Payment Failure Detector',
        description: 'Detects failed invoice payments and card declines',
        icon: CreditCard,
        enabled: true,
        detectedCount: 24,
        resolvedCount: 21,
        amountProtected: 4280,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: 'subscription_past_due',
        name: 'Past Due Monitor',
        description: 'Monitors subscriptions that enter past_due status',
        icon: Clock,
        enabled: true,
        detectedCount: 12,
        resolvedCount: 9,
        amountProtected: 2890,
        lastTriggered: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
        id: 'card_expiring',
        name: 'Card Expiry Predictor',
        description: 'Alerts before payment methods expire',
        icon: AlertTriangle,
        enabled: true,
        detectedCount: 18,
        resolvedCount: 15,
        amountProtected: 3150,
        lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
        id: 'canceled_recoverable',
        name: 'Churn Recovery Window',
        description: 'Identifies recently canceled subscriptions for win-back',
        icon: TrendingDown,
        enabled: true,
        detectedCount: 8,
        resolvedCount: 3,
        amountProtected: 890,
        lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: 'disputed',
        name: 'Dispute Alerter',
        description: 'Alerts on new charge disputes for evidence submission',
        icon: XCircle,
        enabled: true,
        detectedCount: 3,
        resolvedCount: 2,
        amountProtected: 450,
        lastTriggered: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
        id: 'fraud_risk',
        name: 'Fraud Risk Monitor',
        description: 'Monitors early fraud warnings from Stripe Radar',
        icon: Shield,
        enabled: false,
        detectedCount: 0,
        resolvedCount: 0,
        amountProtected: 0,
    },
];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatTimeAgo(date?: Date): string {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function DetectorsContent() {
    const [detectors, setDetectors] = useState<Detector[]>(initialDetectors);

    const toggleDetector = (id: string) => {
        setDetectors(prev => prev.map(d => {
            if (d.id === id) {
                const newEnabled = !d.enabled;
                toast.success(`${d.name} ${newEnabled ? 'enabled' : 'disabled'}`);
                return { ...d, enabled: newEnabled };
            }
            return d;
        }));
    };

    const enabledCount = detectors.filter(d => d.enabled).length;
    const totalProtected = detectors.reduce((sum, d) => sum + d.amountProtected, 0);

    return (
        <DashboardLayout
            title="Leak Detectors"
            subtitle={`${enabledCount} of ${detectors.length} detectors active`}
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
            <div className="grid grid-cols-3 mb-8">
                <div className="stat-card">
                    <div className="stat-card-label">Active Detectors</div>
                    <div className="stat-card-value">{enabledCount}/{detectors.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Total Leaks Detected</div>
                    <div className="stat-card-value">{detectors.reduce((sum, d) => sum + d.detectedCount, 0)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Revenue Protected</div>
                    <div className="stat-card-value text-accent">{formatCurrency(totalProtected)}</div>
                </div>
            </div>

            {/* Detectors Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
                {detectors.map((detector) => {
                    const Icon = detector.icon;
                    return (
                        <div
                            key={detector.id}
                            className="card"
                            style={{
                                opacity: detector.enabled ? 1 : 0.6,
                                transition: 'opacity var(--transition-base)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 'var(--radius-md)',
                                        background: detector.enabled ? 'var(--accent-primary-subtle)' : 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: detector.enabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{detector.name}</h3>
                                        <p className="text-sm text-secondary">{detector.description}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleDetector(detector.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: detector.enabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    }}
                                >
                                    {detector.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 'var(--space-4)',
                                marginTop: 'var(--space-5)',
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--border-subtle)',
                            }}>
                                <div>
                                    <div className="text-xs text-muted">Detected</div>
                                    <div className="text-lg font-semibold">{detector.detectedCount}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted">Resolved</div>
                                    <div className="text-lg font-semibold text-success">{detector.resolvedCount}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted">Protected</div>
                                    <div className="text-lg font-semibold text-accent">{formatCurrency(detector.amountProtected)}</div>
                                </div>
                            </div>

                            <div className="text-xs text-muted mt-3">
                                Last triggered: {formatTimeAgo(detector.lastTriggered)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}

// Protected Detectors Page - requires authentication
export default function DetectorsPage() {
    return (
        <ProtectedRoute requirePayment={false}>
            <DetectorsContent />
        </ProtectedRoute>
    );
}
