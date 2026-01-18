'use client';

import { useState, useEffect } from 'react';
import { Activity, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signUp, user, isPaid, isLoading: authLoading, isConfigured } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Get redirect URL and plan from query params
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const plan = searchParams.get('plan');
    const priceId = searchParams.get('priceId');

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            if (isPaid) {
                router.push(redirectTo);
            } else if (plan && priceId) {
                // Redirect to checkout if coming from pricing
                handleCheckout(priceId, plan);
            } else {
                // Show pricing if not paid
                router.push('/#pricing');
            }
        }
    }, [user, isPaid, authLoading, redirectTo, plan, priceId]);

    const handleCheckout = async (priceId: string, planName: string) => {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: user?.id,
                    email: user?.email || email,
                    plan: planName,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to start checkout');
            }
        } catch (error) {
            toast.error('Checkout failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Sign up
                if (!fullName.trim()) {
                    toast.error('Please enter your name');
                    setIsLoading(false);
                    return;
                }

                const result = await signUp(email, password, fullName);

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Account created! Please check your email to verify.');
                    // If coming from pricing page, redirect to checkout
                    if (plan && priceId) {
                        // Wait for auth state to update, then redirect
                        setTimeout(() => {
                            handleCheckout(priceId, plan);
                        }, 1000);
                    }
                }
            } else {
                // Sign in
                const result = await signIn(email, password);

                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Welcome back!');
                    // Redirect handled by useEffect
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
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
            position: 'relative',
        }}>
            {/* Background Grid */}
            <div className="landing-hero-grid" style={{ position: 'fixed', inset: 0 }} />
            <div className="landing-hero-glow" style={{ position: 'fixed' }} />

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

            <div style={{
                width: '100%',
                maxWidth: '440px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Config Warning */}
                {!isConfigured && (
                    <div style={{
                        background: 'rgba(255, 204, 0, 0.1)',
                        border: '1px solid rgba(255, 204, 0, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-3)',
                    }}>
                        <AlertTriangle size={20} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div className="font-medium" style={{ marginBottom: 'var(--space-1)' }}>
                                Supabase Not Configured
                            </div>
                            <p className="text-sm text-secondary">
                                Authentication requires Supabase. Please add your credentials to <code>.env.local</code> and restart the server.
                            </p>
                        </div>
                    </div>
                )}

                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            background: 'var(--accent-primary)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--space-4)',
                            boxShadow: 'var(--shadow-glow)',
                        }}>
                            <Activity size={32} color="#000" strokeWidth={2.5} />
                        </div>
                    </Link>
                    <h1 style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-bold)',
                        letterSpacing: '-0.02em',
                    }}>
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="text-secondary mt-2">
                        {isSignUp
                            ? 'Start protecting your revenue today'
                            : 'Sign in to your RevLeak dashboard'}
                    </p>
                </div>

                {/* Plan Badge */}
                {plan && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-6)',
                    }}>
                        <div className="landing-badge">
                            <CheckCircle2 size={14} />
                            Selected: {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                        </div>
                    </div>
                )}

                {/* Auth Form Card */}
                <div className="card" style={{ padding: 'var(--space-8)' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Full Name (Sign Up only) */}
                        {isSignUp && (
                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                    }} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="landing-input"
                                        style={{
                                            width: '100%',
                                            paddingLeft: '44px',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div style={{ marginBottom: 'var(--space-5)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }} />
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="landing-input"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '44px',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="landing-input"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '44px',
                                        paddingRight: '44px',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {isSignUp && (
                                <p className="text-xs text-muted mt-2">
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', padding: 'var(--space-4)' }}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        margin: 'var(--space-6) 0',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                        <span className="text-sm text-muted">or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                    </div>

                    {/* Toggle Sign Up / Sign In */}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: 'var(--space-4)' }}
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                    </button>
                </div>

                {/* Back to Home */}
                <p className="text-center text-sm text-muted mt-6">
                    <Link href="/" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                        ← Back to homepage
                    </Link>
                </p>
            </div>
        </div>
    );
}
