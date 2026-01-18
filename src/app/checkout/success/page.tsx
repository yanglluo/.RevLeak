'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Loader2, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshProfile, user } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setIsVerifying(false);
                return;
            }

            try {
                // Verify the checkout session
                const response = await fetch('/api/checkout/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await response.json();

                if (data.success) {
                    setVerified(true);
                    // Refresh user profile to get updated subscription status
                    await refreshProfile();
                }
            } catch (error) {
                console.error('Verification error:', error);
            } finally {
                setIsVerifying(false);
            }
        };

        // Small delay to allow webhook to process
        const timer = setTimeout(verifyPayment, 2000);
        return () => clearTimeout(timer);
    }, [sessionId, refreshProfile]);

    if (isVerifying) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                    <p className="text-lg mt-4">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 'var(--space-4)',
        }}>
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                {/* Success Icon */}
                <div style={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.2) 0%, rgba(0, 255, 102, 0.1) 100%)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-6)',
                    border: '2px solid var(--accent-primary)',
                    boxShadow: '0 0 40px rgba(0, 255, 102, 0.3)',
                }}>
                    <CheckCircle2 size={40} style={{ color: 'var(--accent-primary)' }} />
                </div>

                <h1 style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--font-bold)',
                    marginBottom: 'var(--space-4)',
                    letterSpacing: '-0.02em',
                }}>
                    Welcome to RevLeak!
                </h1>

                <p className="text-secondary text-lg mb-8">
                    Your subscription is now active. You're ready to start detecting revenue leaks and protecting your business.
                </p>

                <div className="card" style={{
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)',
                    textAlign: 'left',
                }}>
                    <h3 className="font-semibold mb-4">What's next?</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                            <span className="text-secondary">Connect your Stripe account to start monitoring</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                            <span className="text-secondary">Configure your alert preferences</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                            <span className="text-secondary">Run your first revenue leak scan</span>
                        </li>
                    </ul>
                </div>

                <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Go to Dashboard
                    <ArrowRight size={18} />
                </Link>

                <p className="text-sm text-muted mt-6">
                    Need help? <a href="mailto:support@revleak.com" className="text-accent">Contact support</a>
                </p>
            </div>
        </div>
    );
}
