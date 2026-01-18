'use client';

import DashboardLayout from '@/components/DashboardLayout';
import {
    HelpCircle,
    Book,
    MessageSquare,
    Mail,
    ExternalLink,
    Zap,
    Shield,
    Bell,
    Settings
} from 'lucide-react';

const faqs = [
    {
        question: 'How does RevLeak detect revenue leaks?',
        answer: 'RevLeak connects to your Stripe account via API and continuously monitors subscriptions, invoices, and payment methods. Our detection engine identifies patterns like failed payments, expiring cards, and past-due subscriptions before they result in lost revenue.',
    },
    {
        question: 'What data does RevLeak access?',
        answer: 'RevLeak requires read-only access to your Stripe subscriptions, customers, invoices, and payment methods. We never process payments or modify your Stripe data without explicit action.',
    },
    {
        question: 'How are intervention windows calculated?',
        answer: 'Intervention windows are based on Stripe\'s retry schedule and your subscription settings. For example, if Stripe retries a failed payment 4 times over 3 weeks, we start the countdown from the first failure to give you maximum time to intervene.',
    },
    {
        question: 'Can RevLeak automatically retry payments?',
        answer: 'Yes, when you click "Retry Payment" on a leak, RevLeak uses the Stripe API to attempt collection. For cards requiring authentication (3DS), we generate a payment update link for the customer.',
    },
    {
        question: 'How do I receive alerts?',
        answer: 'Configure your alert preferences in Settings. You can receive notifications via email, Slack, or custom webhooks. Critical leaks trigger immediate alerts, while warnings are batched in daily digests.',
    },
];

const resources = [
    {
        title: 'Getting Started Guide',
        description: 'Learn how to connect Stripe and configure your first detectors',
        icon: Book,
        href: '#',
    },
    {
        title: 'API Documentation',
        description: 'Integrate RevLeak with your existing systems',
        icon: Zap,
        href: '#',
    },
    {
        title: 'Best Practices',
        description: 'Tips for maximizing revenue recovery',
        icon: Shield,
        href: '#',
    },
];

export default function HelpPage() {
    return (
        <DashboardLayout
            title="Help & Support"
            subtitle="Get help with RevLeak"
        >
            {/* Quick Links */}
            <div className="grid grid-cols-3 mb-8">
                {resources.map((resource) => {
                    const Icon = resource.icon;
                    return (
                        <a
                            key={resource.title}
                            href={resource.href}
                            className="card"
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--accent-primary-subtle)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-primary)',
                                marginBottom: 'var(--space-4)',
                            }}>
                                <Icon size={24} />
                            </div>
                            <h3 className="font-semibold mb-1">{resource.title}</h3>
                            <p className="text-sm text-secondary">{resource.description}</p>
                            <div className="flex items-center gap-1 text-accent text-sm mt-3">
                                Learn more <ExternalLink size={14} />
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* FAQs */}
            <div className="card mb-8">
                <h2 className="card-title mb-6">Frequently Asked Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            style={{
                                padding: 'var(--space-5)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h3 className="font-semibold mb-2">{faq.question}</h3>
                            <p className="text-secondary text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-6)',
            }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <Mail size={24} className="text-accent" />
                        <h3 className="font-semibold">Email Support</h3>
                    </div>
                    <p className="text-secondary text-sm mb-4">
                        Get help from our team via email. We typically respond within 24 hours.
                    </p>
                    <a href="mailto:support@revleak.com" className="btn btn-secondary">
                        <Mail size={16} />
                        support@revleak.com
                    </a>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <MessageSquare size={24} className="text-accent" />
                        <h3 className="font-semibold">Community</h3>
                    </div>
                    <p className="text-secondary text-sm mb-4">
                        Join our community to share tips and get help from other users.
                    </p>
                    <a href="#" className="btn btn-secondary">
                        <ExternalLink size={16} />
                        Join Discord
                    </a>
                </div>
            </div>
        </DashboardLayout>
    );
}
