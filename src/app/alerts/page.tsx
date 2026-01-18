'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Bell,
    Search,
    Filter,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Mail,
    Zap,
    Clock
} from 'lucide-react';

interface Alert {
    id: string;
    type: 'leak_detected' | 'payment_failed' | 'card_expiring' | 'leak_resolved';
    title: string;
    message: string;
    customerName: string;
    amount?: number;
    timestamp: Date;
    read: boolean;
}

const demoAlerts: Alert[] = [
    {
        id: '1',
        type: 'leak_detected',
        title: 'New Leak Detected',
        message: 'Payment failed for subscription - authentication required',
        customerName: 'Acme Corp',
        amount: 2400,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
    },
    {
        id: '2',
        type: 'card_expiring',
        title: 'Card Expiring Soon',
        message: 'Payment method expires in 7 days',
        customerName: 'TechStart Inc',
        amount: 890,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
    },
    {
        id: '3',
        type: 'leak_resolved',
        title: 'Leak Resolved',
        message: 'Customer updated payment method',
        customerName: 'DevShop Co',
        amount: 675,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: true,
    },
    {
        id: '4',
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Insufficient funds on retry attempt #2',
        customerName: 'CloudBase Inc',
        amount: 1250,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
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

function getAlertIcon(type: Alert['type']) {
    switch (type) {
        case 'leak_detected':
            return <AlertTriangle size={20} className="text-warning" />;
        case 'payment_failed':
            return <XCircle size={20} className="text-danger" />;
        case 'card_expiring':
            return <Clock size={20} className="text-warning" />;
        case 'leak_resolved':
            return <CheckCircle2 size={20} className="text-success" />;
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = alerts.filter(a => !a.read).length;
    const filteredAlerts = filter === 'unread' ? alerts.filter(a => !a.read) : alerts;

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const markAllAsRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    };

    return (
        <DashboardLayout
            title="Alerts"
            subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            actions={
                <button
                    className="btn btn-secondary"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <CheckCircle2 size={16} />
                    Mark All as Read
                </button>
            }
        >
            {/* Filter */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                <button
                    className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                >
                    All ({alerts.length})
                </button>
                <button
                    className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Alerts List */}
            <div className="card" style={{ padding: 0 }}>
                {filteredAlerts.length === 0 ? (
                    <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                        <Bell size={48} style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
                        <p className="text-secondary mt-4">No alerts to display</p>
                    </div>
                ) : (
                    <div>
                        {filteredAlerts.map((alert, index) => (
                            <div
                                key={alert.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'var(--space-4)',
                                    padding: 'var(--space-5)',
                                    borderBottom: index < filteredAlerts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                    background: alert.read ? 'transparent' : 'rgba(16, 185, 129, 0.03)',
                                    cursor: 'pointer',
                                    transition: 'background var(--transition-base)',
                                }}
                                onClick={() => markAsRead(alert.id)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = alert.read ? 'transparent' : 'rgba(16, 185, 129, 0.03)'}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-elevated)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {getAlertIcon(alert.type)}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                        <span className="font-semibold">{alert.title}</span>
                                        {!alert.read && (
                                            <span style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--accent-primary)',
                                            }} />
                                        )}
                                    </div>
                                    <p className="text-sm text-secondary">{alert.message}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="text-muted">{alert.customerName}</span>
                                        {alert.amount && (
                                            <>
                                                <span className="text-muted">•</span>
                                                <span className="text-accent font-medium">{formatCurrency(alert.amount)}/mo</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-muted" style={{ flexShrink: 0 }}>
                                    {formatTimeAgo(alert.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
