'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Zap,
    CheckCircle2,
    ExternalLink,
    Settings,
    Mail,
    MessageSquare,
    Webhook,
    Database,
    Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    iconBg: string;
    connected: boolean;
    status?: string;
    configUrl?: string;
}

function IntegrationsContent() {
    const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStripe = async () => {
            try {
                const res = await fetch('/api/sync');
                const result = await res.json();
                setStripeConnected(result.connected);
            } catch {
                setStripeConnected(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkStripe();
    }, []);

    const integrations: Integration[] = [
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Connect your Stripe account to detect revenue leaks',
            icon: Zap,
            iconBg: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)',
            connected: stripeConnected === true,
            status: stripeConnected ? 'Active' : 'Configure API key',
            configUrl: '/settings',
        },
        {
            id: 'email',
            name: 'Email Alerts',
            description: 'Receive leak alerts via email',
            icon: Mail,
            iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            connected: true,
            status: 'Active',
            configUrl: '/settings',
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Get real-time notifications in Slack',
            icon: MessageSquare,
            iconBg: 'linear-gradient(135deg, #4A154B 0%, #611f69 100%)',
            connected: false,
            status: 'Not configured',
            configUrl: '/settings',
        },
        {
            id: 'webhook',
            name: 'Custom Webhooks',
            description: 'Send leak events to your own systems',
            icon: Webhook,
            iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            connected: false,
            status: 'Not configured',
        },
        {
            id: 'supabase',
            name: 'Supabase',
            description: 'Store leak data and user settings',
            icon: Database,
            iconBg: 'linear-gradient(135deg, #3ecf8e 0%, #1c7a4f 100%)',
            connected: false,
            status: 'Coming soon',
        },
    ];

    return (
        <DashboardLayout
            title="Integrations"
            subtitle="Connect RevLeak with your existing tools"
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

            {/* Integrations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)' }}>
                {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                        <div key={integration.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 'var(--radius-lg)',
                                        background: integration.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                                        <p className="text-sm text-secondary mt-1">{integration.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'var(--space-5)',
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--border-subtle)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    {isLoading && integration.id === 'stripe' ? (
                                        <Loader2 size={16} className="animate-spin text-muted" />
                                    ) : integration.connected ? (
                                        <CheckCircle2 size={16} className="text-success" />
                                    ) : (
                                        <div style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--text-muted)',
                                        }} />
                                    )}
                                    <span className={`text-sm ${integration.connected ? 'text-success' : 'text-muted'}`}>
                                        {integration.status}
                                    </span>
                                </div>

                                {integration.configUrl ? (
                                    <a href={integration.configUrl} className="btn btn-secondary btn-sm">
                                        <Settings size={14} />
                                        Configure
                                    </a>
                                ) : (
                                    <button className="btn btn-secondary btn-sm" disabled>
                                        Coming Soon
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Webhook Documentation */}
            <div className="card mt-8">
                <h2 className="card-title mb-4">Stripe Webhook Events</h2>
                <p className="text-secondary mb-4">
                    RevLeak listens to the following Stripe webhook events for real-time leak detection:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
                    {[
                        { event: 'invoice.payment_failed', desc: 'Detect payment failures' },
                        { event: 'invoice.payment_succeeded', desc: 'Resolve payment leaks' },
                        { event: 'customer.subscription.updated', desc: 'Monitor status changes' },
                        { event: 'customer.subscription.deleted', desc: 'Track cancellations' },
                        { event: 'charge.dispute.created', desc: 'Alert on disputes' },
                        { event: 'payment_method.card_automatically_updated', desc: 'Resolve card leaks' },
                    ].map(({ event, desc }) => (
                        <div
                            key={event}
                            style={{
                                padding: 'var(--space-3)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <code className="text-accent text-sm">{event}</code>
                            <p className="text-xs text-muted mt-1">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Protected Integrations Page - requires authentication
export default function IntegrationsPage() {
    return (
        <ProtectedRoute requirePayment={false}>
            <IntegrationsContent />
        </ProtectedRoute>
    );
}
