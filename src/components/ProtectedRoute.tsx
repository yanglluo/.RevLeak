'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePayment?: boolean;
}

export default function ProtectedRoute({ children, requirePayment = true }: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isPaid, isLoading, isConfigured } = useAuth();

    useEffect(() => {
        // Only redirect if Supabase is configured
        if (!isLoading && isConfigured) {
            if (!user) {
                // Not logged in - redirect to login
                router.push('/login');
            } else if (requirePayment && !isPaid) {
                // Logged in but not paid - redirect to pricing
                router.push('/#pricing');
            }
        }
    }, [user, isPaid, isLoading, requirePayment, router, isConfigured]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto' }} />
                    <p className="text-secondary mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    // If Supabase is not configured, show demo mode message
    if (!isConfigured) {
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
                    <div style={{
                        width: 64,
                        height: 64,
                        background: 'rgba(255, 204, 0, 0.15)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-6)',
                        border: '1px solid rgba(255, 204, 0, 0.3)',
                    }}>
                        <AlertTriangle size={32} style={{ color: 'var(--status-warning)' }} />
                    </div>
                    <h2 style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        Authentication Not Configured
                    </h2>
                    <p className="text-secondary mb-6" style={{ lineHeight: 1.7 }}>
                        To access the dashboard, please configure Supabase by setting the following environment variables in your <code>.env.local</code> file:
                    </p>
                    <div className="card" style={{
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        fontSize: 'var(--text-sm)',
                    }}>
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>NEXT_PUBLIC_SUPABASE_URL=</span>
                            <span style={{ color: 'var(--accent-primary)' }}>your_url</span>
                        </div>
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY=</span>
                            <span style={{ color: 'var(--accent-primary)' }}>your_key</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>SUPABASE_SERVICE_ROLE_KEY=</span>
                            <span style={{ color: 'var(--accent-primary)' }}>your_key</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-6">
                        Get your credentials from the{' '}
                        <a
                            href="https://supabase.com/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            Supabase Dashboard
                        </a>
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    // Don't render children if not authorized
    if (!user || (requirePayment && !isPaid)) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto' }} />
                    <p className="text-secondary mt-4">Redirecting...</p>
                </div>
            </div>
        );
    }

    // User is authenticated and (if required) has paid
    return <>{children}</>;
}
