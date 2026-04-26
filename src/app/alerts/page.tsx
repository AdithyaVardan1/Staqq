import Link from 'next/link';
import { Zap, Shield, Clock, Lock, CheckCircle, ArrowRight, Send } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
    title: 'Solana Token Alerts | Staqq',
    description: 'Real-time Solana new token pair alerts with 5-layer rug scoring, delivered to Telegram within 60 seconds. 5-15 quality alerts per day. Launching soon.',
    alternates: {
        canonical: '/alerts',
    },
};

const steps = [
    {
        num: '01',
        title: 'New pair detected',
        desc: 'Helius webhooks catch every new token pair on Raydium and Pump.fun the moment it goes live.',
    },
    {
        num: '02',
        title: '5-layer safety check',
        desc: 'Min $50K liquidity, RugCheck score, top-10 holder concentration, dev wallet history, LP burn status.',
    },
    {
        num: '03',
        title: 'Alert fires to Telegram',
        desc: 'Staqq Score (0-100) attached. You get the signal within 60 seconds. Only Telegram ID stored.',
    },
];

const features = [
    {
        icon: Zap,
        title: 'Quality over noise',
        desc: '5-15 curated alerts per day. Most bots send 200+. We filter hard so you don\'t have to.',
    },
    {
        icon: Clock,
        title: '60-second latency',
        desc: 'From pair creation on-chain to your Telegram in under a minute. Every time.',
    },
    {
        icon: Shield,
        title: '5-layer rug filter',
        desc: 'Liquidity floor, RugCheck score, holder concentration, dev history, and LP burn — all checked before alert fires.',
    },
    {
        icon: Lock,
        title: 'Privacy first',
        desc: 'Only your Telegram ID is stored. No wallet address, no email, no account. Direct response to the Axiom scandal.',
    },
];

const tiers = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        perks: ['5 alerts per day', 'Real-time delivery', 'Staqq Score included', 'No wallet or email needed'],
        cta: 'Get notified at launch',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '$9',
        period: 'per month',
        perks: ['Unlimited alerts', 'Priority alert queue', 'Full filter breakdown per token', 'USDC or card payment'],
        cta: 'Get notified at launch',
        highlight: true,
    },
];

export default function AlertsPage() {
    return (
        <main className={styles.page}>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.badge}>
                    <span className={styles.badgeDot} />
                    Launching soon
                </div>
                <h1 className={styles.title}>
                    Solana Alpha.<br />
                    <span className={styles.accent}>Delivered.</span>
                </h1>
                <p className={styles.subtitle}>
                    Real-time Solana new token pair alerts with 5-layer rug scoring, fired to your Telegram within 60 seconds of pair creation on Raydium and Pump.fun.
                </p>
                <a
                    href="https://t.me/StaqqBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaBtn}
                >
                    <Send size={16} />
                    Follow @StaqqBot on Telegram
                </a>
                <p className={styles.heroNote}>
                    No account. No wallet. Just your Telegram.
                </p>
            </section>

            <div className={styles.wrap}>

                {/* How it works */}
                <section className={styles.section}>
                    <div className={styles.eyebrow}>HOW IT WORKS</div>
                    <h2 className={styles.sectionTitle}>Three steps. Sixty seconds.</h2>
                    <div className={styles.steps}>
                        {steps.map((step) => (
                            <div key={step.num} className={styles.step}>
                                <div className={styles.stepNum}>{step.num}</div>
                                <div>
                                    <div className={styles.stepTitle}>{step.title}</div>
                                    <div className={styles.stepDesc}>{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className={styles.section}>
                    <div className={styles.eyebrow}>WHY STAQQ ALERTS</div>
                    <h2 className={styles.sectionTitle}>Built different from day one</h2>
                    <div className={styles.featureGrid}>
                        {features.map((f) => (
                            <div key={f.title} className={styles.featureCard}>
                                <f.icon size={22} className={styles.featureIcon} />
                                <div className={styles.featureTitle}>{f.title}</div>
                                <div className={styles.featureDesc}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section className={styles.section}>
                    <div className={styles.eyebrow}>PRICING</div>
                    <h2 className={styles.sectionTitle}>Simple. No gotchas.</h2>
                    <div className={styles.pricingGrid}>
                        {tiers.map((tier) => (
                            <div key={tier.name} className={`${styles.pricingCard} ${tier.highlight ? styles.pricingCardPro : ''}`}>
                                {tier.highlight && <div className={styles.proBadge}>Most popular</div>}
                                <div className={styles.tierName}>{tier.name}</div>
                                <div className={styles.tierPrice}>
                                    {tier.price}
                                    <span className={styles.tierPeriod}> / {tier.period}</span>
                                </div>
                                <ul className={styles.perkList}>
                                    {tier.perks.map((perk) => (
                                        <li key={perk} className={styles.perk}>
                                            <CheckCircle size={14} className={styles.perkIcon} />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="https://t.me/StaqqBot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={tier.highlight ? styles.ctaBtn : styles.ctaBtnOutline}
                                >
                                    {tier.cta}
                                    <ArrowRight size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom note */}
                <div className={styles.bottomNote}>
                    <p>
                        Also on Staqq: <Link href="/ipo" className={styles.inlineLink}>Indian IPO GMP</Link>,{' '}
                        <Link href="/signals/fii-dii" className={styles.inlineLink}>FII/DII flows</Link>,{' '}
                        <Link href="/stocks/screener" className={styles.inlineLink}>stock screener</Link>.
                    </p>
                </div>

            </div>
        </main>
    );
}
