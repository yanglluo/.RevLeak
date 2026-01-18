'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Activity,
    Eye,
    Zap,
    Shield,
    TrendingUp,
    Clock,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    Menu,
    X,
    Mail,
    Phone,
    Twitter,
    Linkedin,
    Github,
    Globe,
    CreditCard,
    Bell,
    BarChart3,
    Settings
} from 'lucide-react';

// Custom hook for scroll reveal animations
function useScrollReveal() {
    useEffect(() => {
        const reveals = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(reveal => observer.observe(reveal));

        return () => observer.disconnect();
    }, []);
}

// Navigation Component
function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="landing-nav">
            <div className="landing-nav-container">
                <Link href="/" className="landing-logo">
                    <div className="landing-logo-icon">
                        <Activity size={20} />
                    </div>
                    <span className="landing-logo-text">RevLeak</span>
                </Link>

                <div className="landing-nav-links">
                    <a href="#features" className="landing-nav-link">Features</a>
                    <a href="#capabilities" className="landing-nav-link">Capabilities</a>
                    <a href="#how-it-works" className="landing-nav-link">How it works</a>
                    <a href="#pricing" className="landing-nav-link">Pricing</a>
                </div>

                <div className="landing-nav-actions">
                    <Link href="/login" className="btn btn-ghost">Sign in</Link>
                    <a href="#contact" className="btn btn-primary">Request demo</a>
                </div>

                <button
                    className="landing-mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="landing-mobile-menu">
                    <a href="#features" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#capabilities" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
                    <a href="#how-it-works" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                    <a href="#pricing" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                    <Link href="/login" className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-4)' }}>Sign in</Link>
                    <a href="#contact" className="btn btn-primary" style={{ width: '100%' }}>Request demo</a>
                </div>
            )}
        </nav>
    );
}

// Hero Section
function HeroSection() {
    return (
        <section className="landing-hero">
            {/* Background Layers */}
            <div className="landing-hero-grid" />
            <div className="landing-hero-glow" />

            {/* Animated Scanning Lines */}
            <div className="hero-scan-lines">
                <div className="hero-scan-line hero-scan-line-1" />
                <div className="hero-scan-line hero-scan-line-2" />
            </div>

            {/* Horizontal Beam Effect */}
            <div className="hero-beam" />

            {/* Floating Glow Orbs */}
            <div className="landing-hero-orbs">
                <div className="landing-hero-orb landing-hero-orb-1" />
                <div className="landing-hero-orb landing-hero-orb-2" />
                <div className="landing-hero-orb landing-hero-orb-3" />
            </div>

            {/* Floating Particles */}
            <div className="hero-particles">
                <div className="hero-particle hero-particle-1" />
                <div className="hero-particle hero-particle-2" />
                <div className="hero-particle hero-particle-3" />
                <div className="hero-particle hero-particle-4" />
                <div className="hero-particle hero-particle-5" />
                <div className="hero-particle hero-particle-6" />
            </div>

            <div className="landing-container">
                <div className="landing-hero-content">
                    <div className="landing-badge">
                        <span className="landing-badge-dot" />
                        <span className="landing-badge-text">Real-time Revenue Intelligence</span>
                    </div>

                    <h1 className="landing-hero-title">
                        Unbreakable revenue visibility
                        <span className="landing-hero-subtitle">for modern SaaS</span>
                    </h1>

                    <p className="landing-hero-description">
                        Even the smallest revenue leak leaves a trace.
                        <br />
                        RevLeak surfaces the signals others miss.
                    </p>

                    <div className="landing-hero-actions">
                        <a href="#contact" className="btn btn-primary btn-lg btn-glow">
                            Request demo
                            <ArrowRight size={18} />
                        </a>
                        <a href="#how-it-works" className="btn btn-secondary btn-lg">
                            Discover more
                            <ChevronDown size={18} />
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="hero-trust-indicators">
                        <div className="trust-item">
                            <Shield size={16} />
                            <span>SOC 2 Compliant</span>
                        </div>
                        <div className="trust-divider" />
                        <div className="trust-item">
                            <Zap size={16} />
                            <span>99.9% Uptime</span>
                        </div>
                        <div className="trust-divider" />
                        <div className="trust-item">
                            <TrendingUp size={16} />
                            <span>$50M+ Protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Logo Ticker
function LogoTicker() {
    const logos = ['Flowbyte', 'CipherCloud', 'Novastack', 'Zunapulse', 'Flowbyte', 'CipherCloud'];

    return (
        <section className="landing-ticker">
            <div className="landing-ticker-track">
                {[...logos, ...logos].map((logo, i) => (
                    <div key={i} className="landing-ticker-item">
                        <Globe size={20} />
                        <span>{logo}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Statement Section
function StatementSection() {
    return (
        <section className="landing-statement">
            <div className="landing-container">
                <p className="landing-statement-text">
                    Revenue monitoring shouldn't feel like a chore.
                    <br />
                    With automated detection and continuous analysis, your revenue{' '}
                    <span className="landing-highlight">stays visible, even while you sleep.</span>
                </p>
            </div>
        </section>
    );
}

// Features Section
function FeaturesSection() {
    const features = [
        {
            icon: Activity,
            title: 'Real-time revenue detection',
            subtitle: 'Instant visibility. Instant action.',
            description: 'Suspicious behavior gets flagged the second it appears. No lag. No noise.',
        },
        {
            icon: Eye,
            title: 'No revenue blind spots',
            subtitle: 'See everything. Miss nothing.',
            description: 'Full visibility into every endpoint, request, and action. If it moves, we see it.',
        },
        {
            icon: Zap,
            title: 'Stripe-native integration',
            subtitle: 'Plug into your stack. Fast.',
            description: 'Connect in minutes. Works with the tools you already use, right out of the box.',
        },
    ];

    return (
        <section id="features" className="landing-section section-vignette">
            <div className="landing-container">
                <div className="landing-section-badge reveal">Features</div>
                <h2 className="landing-section-title reveal">Build to protect every layer</h2>
                <p className="landing-section-subtitle reveal">
                    From backend to browser, every part of your stack stays locked down.
                </p>

                <div className="landing-features-grid">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <div key={i} className={`landing-feature-card reveal reveal-delay-${i + 1}`}>
                                <div className="landing-feature-icon-wrapper">
                                    <div className="landing-feature-icon">
                                        <Icon size={32} />
                                    </div>
                                </div>
                                <div className="landing-feature-meta">{feature.subtitle}</div>
                                <h3 className="landing-feature-title">{feature.title}</h3>
                                <p className="landing-feature-description">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// Capabilities Section
function CapabilitiesSection() {
    const capabilities = [
        {
            icon: TrendingUp,
            title: 'Built to scale with your revenue',
            description: "Whether you're at $5k or $5M MRR, RevLeak adapts to your revenue complexity.",
        },
        {
            icon: Globe,
            title: 'Global revenue visibility',
            description: 'Stay protected across locations, clouds and teams.',
        },
        {
            icon: Shield,
            title: 'Revenue anomaly detection',
            description: 'Detects subtle deviations in user and system behavior.',
        },
        {
            icon: Bell,
            title: 'Custom revenue alerts',
            description: 'Customize how your system reacts — with building blocks for threat response logic.',
        },
        {
            icon: Settings,
            title: 'No manual revenue audits',
            description: 'Forget manual patching or policy tuning. Our pro tier keeps everything current and resilient.',
        },
    ];

    return (
        <section id="capabilities" className="landing-section landing-section-dark section-glow">
            <div className="landing-container">
                <div className="landing-section-badge reveal">Advanced Capabilities</div>
                <h2 className="landing-section-title reveal">
                    Monitor revenue.
                    <br />
                    Fix what matters.
                </h2>
                <p className="landing-section-subtitle reveal">
                    These advanced capabilities give you the automation, flexibility, and resilience needed to stay ahead of revenue loss.
                </p>

                <div className="landing-capabilities-grid">
                    {capabilities.map((cap, i) => {
                        const Icon = cap.icon;
                        return (
                            <div key={i} className={`landing-capability-card reveal reveal-delay-${Math.min(i + 1, 6)}`}>
                                <div className="landing-capability-icon">
                                    <Icon size={24} />
                                </div>
                                <h3 className="landing-capability-title">{cap.title}</h3>
                                <p className="landing-capability-description">{cap.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// How It Works Section
function HowItWorksSection() {
    const steps = [
        {
            number: '01',
            title: 'Connect Stripe. Surface revenue leaks instantly.',
            description: 'The system analyzes payments, subscriptions, churn, pricing, and fees the moment you connect.',
            icon: Zap,
        },
        {
            number: '02',
            title: 'Detect Revenue Leaks Early',
            description: 'Once revenue issues are detected, RevLeak highlights their impact and shows exactly where to focus.',
            icon: Eye,
        },
        {
            number: '03',
            title: 'Stay ahead of silent revenue loss',
            description: 'RevLeak continuously analyzes your revenue data to surface issues as they happen — without manual review.',
            icon: Shield,
        },
    ];

    return (
        <section id="how-it-works" className="landing-section section-vignette">
            <div className="landing-container">
                <div className="landing-section-badge reveal">How it works</div>
                <h2 className="landing-section-title reveal">How RevLeak monitors your revenue</h2>
                <p className="landing-section-subtitle reveal">
                    No complexity. Just clear revenue visibility in three simple steps.
                </p>

                <div className="landing-steps-grid">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={i} className={`landing-step-card reveal reveal-delay-${i + 1}`}>
                                <div className="landing-step-number">{step.number}</div>
                                <div className="landing-step-icon">
                                    <Icon size={28} />
                                </div>
                                <h3 className="landing-step-title">{step.title}</h3>
                                <p className="landing-step-description">{step.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="landing-cta-box reveal">
                    <a href="#contact" className="btn btn-primary btn-lg btn-glow">
                        Request demo
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}

// Social Proof Section
function SocialProofSection() {
    return (
        <section className="landing-section landing-section-proof">
            <div className="landing-container">
                <h2 className="landing-section-title">
                    Trusted by teams that
                    <br />
                    take revenue seriously
                </h2>
                <p className="landing-section-subtitle">
                    SaaS teams rely on RevLeak to catch revenue loss before it compounds.
                </p>
            </div>
        </section>
    );
}

// Pricing Section
function PricingSection() {
    const [annual, setAnnual] = useState(true);

    // IMPORTANT: Replace these with your actual Stripe Price IDs
    // Create products and prices in Stripe Dashboard: https://dashboard.stripe.com/products
    const plans = [
        {
            name: 'Starter',
            description: 'Ideal for early-stage SaaS teams who want visibility into revenue leaks.',
            price: annual ? 19 : 24,
            priceId: annual ? 'price_starter_yearly' : 'price_starter_monthly', // Replace with your Stripe price IDs
            features: [
                'Up to $50k MRR monitored',
                '3 revenue detectors',
                'Email alerts',
                'Basic reporting',
                '7-day data history',
            ],
            highlighted: false,
        },
        {
            name: 'Growth',
            description: 'Built for growing SaaS teams that need continuous revenue monitoring.',
            price: annual ? 49 : 59,
            priceId: annual ? 'price_growth_yearly' : 'price_growth_monthly', // Replace with your Stripe price IDs
            features: [
                'Up to $500k MRR monitored',
                'All 6 revenue detectors',
                'Email + Slack alerts',
                'Advanced analytics',
                '30-day data history',
                'Priority support',
            ],
            highlighted: true,
        },
        {
            name: 'Enterprise',
            description: 'Designed for teams that need deeper revenue visibility and reporting.',
            price: annual ? 99 : 119,
            priceId: annual ? 'price_enterprise_yearly' : 'price_enterprise_monthly', // Replace with your Stripe price IDs
            features: [
                'Unlimited MRR monitored',
                'Custom detectors',
                'Webhooks & API access',
                'Custom reporting',
                'Unlimited data history',
                'Dedicated support',
                'SSO & security controls',
            ],
            highlighted: false,
        },
    ];

    return (
        <section id="pricing" className="landing-section landing-section-dark section-glow">
            <div className="landing-container">
                <div className="landing-section-badge reveal">Pricing</div>
                <h2 className="landing-section-title reveal">
                    Serious Revenue Monitoring.
                    <br />
                    Simple Pricing.
                </h2>
                <p className="landing-section-subtitle reveal">
                    Pick the plan that fits your team. No hidden fees. No contracts. Just visibility into lost revenue.
                </p>

                <div className="landing-pricing-toggle reveal">
                    <button
                        className={`landing-pricing-toggle-btn ${!annual ? 'active' : ''}`}
                        onClick={() => setAnnual(false)}
                    >
                        Monthly
                    </button>
                    <button
                        className={`landing-pricing-toggle-btn ${annual ? 'active' : ''}`}
                        onClick={() => setAnnual(true)}
                    >
                        Yearly
                        <span className="landing-pricing-save">Save 20%</span>
                    </button>
                </div>

                <div className="landing-pricing-grid">
                    {plans.map((plan, i) => (
                        <div key={i} className={`landing-pricing-card reveal reveal-delay-${i + 1} ${plan.highlighted ? 'highlighted' : ''}`}>
                            <div className="landing-pricing-header">
                                <h3 className="landing-pricing-name">{plan.name}</h3>
                                <p className="landing-pricing-description">{plan.description}</p>
                            </div>
                            <div className="landing-pricing-price">
                                <span className="landing-pricing-amount">${plan.price}</span>
                                <span className="landing-pricing-period">/month</span>
                            </div>
                            <ul className="landing-pricing-features">
                                {plan.features.map((feature, j) => (
                                    <li key={j}>
                                        <CheckCircle2 size={16} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/login?plan=${plan.name.toLowerCase()}&priceId=${plan.priceId}`}
                                className={`btn ${plan.highlighted ? 'btn-primary btn-glow' : 'btn-secondary'}`}
                                style={{ width: '100%' }}
                            >
                                Get started
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// FAQ Section
function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: 'Do I need to install anything?',
            answer: 'Nope. RevLeak connects directly to Stripe using secure, read-only access.',
        },
        {
            question: 'Does RevLeak change my Stripe data?',
            answer: 'Never. RevLeak only reads data to detect revenue issues.',
        },
        {
            question: 'How fast can I see results?',
            answer: 'Most teams see their first revenue leaks within minutes of connecting.',
        },
    ];

    return (
        <section className="landing-faq">
            <div className="landing-container">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`landing-faq-item ${openIndex === i ? 'open' : ''}`}
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                        <div className="landing-faq-question">
                            <span>{faq.question}</span>
                            <ChevronDown size={20} className={`landing-faq-icon ${openIndex === i ? 'rotated' : ''}`} />
                        </div>
                        {openIndex === i && (
                            <div className="landing-faq-answer">{faq.answer}</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

// Contact Section
function ContactSection() {
    const badges = [
        'Read-only Stripe Access',
        'No Credit Card Needed',
        'Secure By Design',
        'Cancel Anytime',
        'No Write Permissions',
        'Setup In Minutes',
    ];

    return (
        <section id="contact" className="landing-section landing-section-contact">
            <div className="landing-container">
                <div className="landing-contact-grid">
                    <div className="landing-contact-info">
                        <div className="landing-section-badge">Contact</div>
                        <h2 className="landing-section-title">Stay ahead of revenue leaks</h2>
                        <p className="landing-section-subtitle" style={{ textAlign: 'left' }}>
                            Connect Stripe in minutes. No setup. No spreadsheets.
                        </p>

                        <div className="landing-contact-badges">
                            {badges.map((badge, i) => (
                                <div key={i} className="landing-contact-badge">
                                    <CheckCircle2 size={14} />
                                    {badge}
                                </div>
                            ))}
                        </div>

                        <FAQSection />
                    </div>

                    <div className="landing-contact-form-wrapper">
                        <form className="landing-contact-form">
                            <div className="landing-form-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your name" className="landing-input" />
                            </div>
                            <div className="landing-form-group">
                                <label>Email</label>
                                <input type="email" placeholder="you@company.com" className="landing-input" />
                            </div>
                            <div className="landing-form-group">
                                <label>Message</label>
                                <textarea placeholder="Type your message..." className="landing-input landing-textarea" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Send Message
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="landing-footer">
            <div className="landing-container">
                <div className="landing-footer-grid">
                    <div className="landing-footer-brand">
                        <Link href="/" className="landing-logo">
                            <div className="landing-logo-icon">
                                <Activity size={20} />
                            </div>
                            <span className="landing-logo-text">RevLeak</span>
                        </Link>
                        <p className="landing-footer-tagline">
                            Revenue visibility for modern SaaS.
                        </p>
                        <div className="landing-footer-contact">
                            <a href="mailto:support@revleak.com">
                                <Mail size={16} />
                                support@revleak.com
                            </a>
                            <a href="tel:+17788968891">
                                <Phone size={16} />
                                +1 778 896 8891
                            </a>
                        </div>
                    </div>

                    <div className="landing-footer-links">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#capabilities">Capabilities</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#pricing">Pricing</a>
                    </div>

                    <div className="landing-footer-links">
                        <h4>Company</h4>
                        <a href="#contact">Contact</a>
                        <Link href="/login">Sign in</Link>
                    </div>

                    <div className="landing-footer-social">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <Linkedin size={20} />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Github size={20} />
                        </a>
                    </div>
                </div>

                <div className="landing-footer-bottom">
                    <p>© 2026 RevLeak. All rights reserved.</p>
                    <p>
                        Built by <a href="https://yangluo.dev" target="_blank" rel="noopener noreferrer">Yang Luo</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

// Main Landing Page
export default function LandingPage() {
    // Enable scroll reveal animations
    useScrollReveal();

    return (
        <div className="landing-page">
            <Navigation />
            <HeroSection />
            <LogoTicker />
            <StatementSection />
            <FeaturesSection />
            <CapabilitiesSection />
            <HowItWorksSection />
            <SocialProofSection />
            <PricingSection />
            <ContactSection />
            <Footer />
        </div>
    );
}
