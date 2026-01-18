'use client';

import {
    LayoutDashboard,
    AlertTriangle,
    TrendingUp,
    Settings,
    Users,
    CreditCard,
    Bell,
    Shield,
    Zap,
    HelpCircle,
    LogOut,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: string;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const navigation: NavSection[] = [
    {
        label: 'Overview',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: AlertTriangle, label: 'Active Leaks', href: '/leaks', badge: '3' },
            { icon: TrendingUp, label: 'Revenue Saved', href: '/saved' },
        ],
    },
    {
        label: 'Monitoring',
        items: [
            { icon: CreditCard, label: 'Subscriptions', href: '/subscriptions' },
            { icon: Users, label: 'Customers', href: '/customers' },
            { icon: Bell, label: 'Alerts', href: '/alerts' },
        ],
    },
    {
        label: 'System',
        items: [
            { icon: Shield, label: 'Detectors', href: '/detectors' },
            { icon: Zap, label: 'Integrations', href: '/integrations' },
            { icon: Settings, label: 'Settings', href: '/settings' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <aside className="sidebar">
            {/* Logo Header */}
            <div className="sidebar-header">
                <Link href="/dashboard" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                    <div className="sidebar-logo-icon">
                        <Activity size={20} color="#000" strokeWidth={2.5} />
                    </div>
                    <span className="sidebar-logo-text">RevLeak</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navigation.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="nav-section">
                        <div className="nav-section-label">{section.label}</div>
                        {section.items.map((item, itemIndex) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={itemIndex}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className="nav-icon" size={18} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {item.badge && (
                                        <span style={{
                                            background: 'var(--status-danger)',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 'var(--radius-full)',
                                            boxShadow: '0 0 10px rgba(255, 51, 102, 0.4)',
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {/* User Info */}
                {profile && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        marginBottom: 'var(--space-2)',
                        background: 'rgba(0, 255, 102, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(0, 255, 102, 0.1)',
                    }}>
                        <div className="text-sm font-medium" style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {profile.full_name || 'User'}
                        </div>
                        <div className="text-xs text-muted" style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {profile.email}
                        </div>
                    </div>
                )}
                <Link href="/help" className="nav-item">
                    <HelpCircle className="nav-icon" size={18} />
                    <span>Help & Support</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="nav-item"
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <LogOut className="nav-icon" size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

