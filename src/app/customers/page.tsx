'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Users,
    Search,
    RefreshCw,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Mail,
    ArrowUpRight,
    DollarSign
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Customer {
    id: string;
    stripeId: string;
    email: string;
    name: string;
    subscriptionStatus: string;
    mrr: number;
    currency: string;
    healthScore: 'healthy' | 'at_risk' | 'critical';
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

function CustomersContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'healthy' | 'at_risk' | 'critical'>('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const result = await res.json();
            if (result.success) {
                // Deduplicate by email
                const uniqueCustomers = result.data.customers.reduce((acc: Customer[], c: Customer) => {
                    if (!acc.find(x => x.email === c.email)) {
                        acc.push(c);
                    }
                    return acc;
                }, []);
                setCustomers(uniqueCustomers);
            }
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalCustomers = customers.length;
    const atRiskCustomers = customers.filter(c => c.healthScore !== 'healthy').length;
    const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || c.healthScore === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout
            title="Customers"
            subtitle={`${totalCustomers} customers • ${atRiskCustomers} at risk`}
            actions={
                <button className="btn btn-primary" onClick={fetchData} disabled={isLoading}>
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
                    <div className="stat-card-label">Total Customers</div>
                    <div className="stat-card-value">{totalCustomers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Total MRR</div>
                    <div className="stat-card-value">{formatCurrency(totalMRR)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">At Risk</div>
                    <div className="stat-card-value text-warning">{atRiskCustomers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Avg. MRR/Customer</div>
                    <div className="stat-card-value">
                        {formatCurrency(totalCustomers > 0 ? totalMRR / totalCustomers : 0)}
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
                        placeholder="Search customers..."
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

            {/* Customer Grid */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                    <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="card" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--accent-primary-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-primary)',
                                    fontWeight: 600,
                                }}>
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                {customer.healthScore === 'healthy' ? (
                                    <CheckCircle2 size={18} className="text-success" />
                                ) : (
                                    <AlertTriangle size={18} className={customer.healthScore === 'critical' ? 'text-danger' : 'text-warning'} />
                                )}
                            </div>

                            <h3 className="font-semibold">{customer.name}</h3>
                            <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                                <Mail size={12} />
                                {customer.email}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <div className="text-lg font-bold text-accent">{formatCurrency(customer.mrr)}</div>
                                    <div className="text-xs text-muted">MRR</div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <span className={`badge ${customer.subscriptionStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {customer.subscriptionStatus}
                                    </span>
                                    <a
                                        href={`https://dashboard.stripe.com/customers/${customer.stripeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-ghost btn-sm"
                                    >
                                        <ArrowUpRight size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

// Protected Customers Page - requires authentication
export default function CustomersPage() {
    return (
        <ProtectedRoute requirePayment={false}>
            <CustomersContent />
        </ProtectedRoute>
    );
}
