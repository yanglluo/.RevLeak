'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings,
    Zap,
    Bell,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    ExternalLink,
    Key,
    AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const [stripeStatus, setStripeStatus] = useState<{
        connected: boolean;
        account?: { id: string; businessName?: string; email?: string };
        error?: string;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        alertEmail: '',
        emailNotifications: true,
        slackWebhook: '',
        autoRetryEnabled: true,
        interventionThresholdHours: 24,
    });

    // Check Stripe status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/sync');
                const result = await res.json();
                setStripeStatus(result);
            } catch (error) {
                setStripeStatus({ connected: false, error: 'Failed to check connection' });
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            // In production, save to database
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Configure your RevLeak integration and preferences"
            actions={
                <button
                    className="btn btn-primary"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                {/* Stripe Connection */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Zap size={24} color="white" />
                        </div>
                        <div>
                            <h2 className="card-title">Stripe Connection</h2>
                            <p className="text-sm text-secondary">Connect your Stripe account to detect leaks</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{
                            padding: 'var(--space-8)',
                            textAlign: 'center',
                            background: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                            <p className="text-sm text-secondary mt-3">Checking connection...</p>
                        </div>
                    ) : stripeStatus?.connected ? (
                        <div style={{
                            padding: 'var(--space-5)',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                <CheckCircle2 size={20} className="text-success" />
                                <span className="font-semibold text-success">Connected</span>
                            </div>
                            {stripeStatus.account && (
                                <div className="text-sm">
                                    <p><strong>Account ID:</strong> {stripeStatus.account.id}</p>
                                    {stripeStatus.account.businessName && (
                                        <p><strong>Business:</strong> {stripeStatus.account.businessName}</p>
                                    )}
                                    {stripeStatus.account.email && (
                                        <p><strong>Email:</strong> {stripeStatus.account.email}</p>
                                    )}
                                </div>
                            )}
                            <a
                                href="https://dashboard.stripe.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm mt-4"
                            >
                                <ExternalLink size={14} />
                                Open Stripe Dashboard
                            </a>
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                padding: 'var(--space-5)',
                                background: 'rgba(250, 204, 21, 0.1)',
                                border: '1px solid rgba(250, 204, 21, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-4)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                    <AlertTriangle size={20} className="text-warning" />
                                    <span className="font-semibold text-warning">Not Connected</span>
                                </div>
                                <p className="text-sm text-secondary">
                                    Add your Stripe secret key to your environment variables to enable revenue leak detection.
                                </p>
                            </div>

                            <div style={{
                                padding: 'var(--space-4)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-sm)',
                            }}>
                                <p className="text-muted mb-2"># Add to .env.local:</p>
                                <p className="text-accent">STRIPE_SECRET_KEY=sk_live_...</p>
                            </div>

                            <div className="mt-4">
                                <a
                                    href="https://dashboard.stripe.com/apikeys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <Key size={16} />
                                    Get API Keys from Stripe
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-primary-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                        }}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="card-title">Alert Settings</h2>
                            <p className="text-sm text-secondary">Configure how you receive leak alerts</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <div>
                            <label className="text-sm font-medium mb-2" style={{ display: 'block' }}>
                                Alert Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="alerts@yourcompany.com"
                                value={settings.alertEmail}
                                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="font-medium">Email Notifications</div>
                                <div className="text-sm text-secondary">Receive alerts for new leaks</div>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                style={{
                                    width: 48,
                                    height: 28,
                                    borderRadius: 'var(--radius-full)',
                                    background: settings.emailNotifications ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all var(--transition-base)',
                                }}
                            >
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'white',
                                    position: 'absolute',
                                    top: 3,
                                    left: settings.emailNotifications ? 24 : 3,
                                    transition: 'left var(--transition-base)',
                                }} />
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2" style={{ display: 'block' }}>
                                Slack Webhook URL (Optional)
                            </label>
                            <input
                                type="url"
                                placeholder="https://hooks.slack.com/services/..."
                                value={settings.slackWebhook}
                                onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Detection Settings */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-primary-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                        }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="card-title">Detection Settings</h2>
                            <p className="text-sm text-secondary">Configure leak detection behavior</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="font-medium">Auto-Retry Payments</div>
                                <div className="text-sm text-secondary">Automatically retry failed payments</div>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, autoRetryEnabled: !settings.autoRetryEnabled })}
                                style={{
                                    width: 48,
                                    height: 28,
                                    borderRadius: 'var(--radius-full)',
                                    background: settings.autoRetryEnabled ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all var(--transition-base)',
                                }}
                            >
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'white',
                                    position: 'absolute',
                                    top: 3,
                                    left: settings.autoRetryEnabled ? 24 : 3,
                                    transition: 'left var(--transition-base)',
                                }} />
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2" style={{ display: 'block' }}>
                                Alert Threshold (hours)
                            </label>
                            <p className="text-xs text-secondary mb-2">
                                Alert when intervention window is below this threshold
                            </p>
                            <select
                                value={settings.interventionThresholdHours}
                                onChange={(e) => setSettings({ ...settings, interventionThresholdHours: Number(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                }}
                            >
                                <option value={12}>12 hours</option>
                                <option value={24}>24 hours</option>
                                <option value={48}>48 hours</option>
                                <option value={72}>72 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Webhook Setup */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-primary-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                        }}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="card-title">Webhook Setup</h2>
                            <p className="text-sm text-secondary">Configure real-time event processing</p>
                        </div>
                    </div>

                    <div style={{
                        padding: 'var(--space-4)',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        <p className="text-sm text-secondary mb-2">Add this webhook endpoint to Stripe:</p>
                        <code style={{
                            display: 'block',
                            padding: 'var(--space-3)',
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--accent-primary)',
                            wordBreak: 'break-all',
                        }}>
                            {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhooks/stripe
                        </code>
                    </div>

                    <div className="text-sm text-secondary mb-4">
                        <p className="font-medium mb-2">Required events:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                'invoice.payment_failed',
                                'invoice.payment_succeeded',
                                'customer.subscription.updated',
                                'customer.subscription.deleted',
                                'charge.dispute.created',
                            ].map((event) => (
                                <li key={event} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    padding: 'var(--space-1) 0',
                                }}>
                                    <CheckCircle2 size={14} className="text-success" />
                                    <code style={{ fontSize: 'var(--text-xs)' }}>{event}</code>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <a
                        href="https://dashboard.stripe.com/webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                    >
                        <ExternalLink size={16} />
                        Configure in Stripe
                    </a>
                </div>
            </div>
        </DashboardLayout>
    );
}
