import Link from 'next/link';
import { Zap, Wallet, Shield, Rocket, ArrowRight, Crown } from 'lucide-react';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Crypto Intelligence Suite | Staqq',
    description: 'Track social signals, copy smart wallets, scan tokens for rugpulls, and discover new launches. Everything crypto traders need in one place.',
    openGraph: {
        title: 'Crypto Intelligence Suite | Staqq',
        description: 'Social signals, wallet tracker, token scanner, and new launch feed for serious crypto traders.',
    },
};

const SUITE = [
    {
        href: '/crypto/signals',
        icon: <Zap size={28} />,
        title: 'Social Signals',
        description: 'Tokens surging on Reddit and crypto Twitter before they hit mainstream. Real-time social velocity scoring.',
        badge: null,
        pro: 'Real-time (6h delay for free)',
        color: '#22c55e',
    },
    {
        href: '/crypto/wallets',
        icon: <Wallet size={28} />,
        title: 'Wallet Tracker',
        description: 'Paste any ETH or Solana wallet address and see exactly what tokens they\'ve been buying. Follow smart money.',
        badge: null,
        pro: 'Unlimited saves + email alerts (Pro)',
        color: '#a78bfa',
    },
    {
        href: '/crypto/scanner',
        icon: <Shield size={28} />,
        title: 'Token Scanner',
        description: 'Paste any contract address and get a full rugpull risk analysis: honeypot detection, holder concentration, LP locks, and more.',
        badge: null,
        pro: 'Free for all users',
        color: '#CAFF00',
    },
    {
        href: '/crypto/new-tokens',
        icon: <Rocket size={28} />,
        title: 'New Launches',
        description: 'Fresh token launches auto-scanned for safety. Filter by risk level and find gems before they go viral.',
        badge: 'New',
        pro: 'Free to view, Pro for alerts',
        color: '#f97316',
    },
];

const FREE_FEATURES = [
    'Social signal feed (6h delay)',
    'Track up to 3 wallets (guest) / 5 wallets (free account)',
    'Token safety scanner (unlimited)',
    'New token launch feed',
];

const PRO_FEATURES = [
    'Real-time signals, no delay',
    'Unlimited wallet tracking',
    'Email alerts when tracked wallets buy',
    'New token alerts before they spike',
    'Priority safety scans',
];

export default function CryptoHubPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <section className={styles.hero}>
                    <div className={styles.heroBadge}>Crypto Intelligence Suite</div>
                    <h1 className={styles.heroTitle}>
                        Find gems. Avoid rugs.<br />
                        <span className={styles.accent}>Copy smart money.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Everything serious crypto traders need: social signals, wallet intelligence,
                        safety scanning, and new launch discovery. All in one place.
                    </p>
                </section>

                <div className={styles.grid}>
                    {SUITE.map(item => (
                        <Link key={item.href} href={item.href} className={styles.card}>
                            <div className={styles.cardIcon} style={{ color: item.color, background: `${item.color}15` }}>
                                {item.icon}
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.cardTitleRow}>
                                    <h2 className={styles.cardTitle}>{item.title}</h2>
                                    {item.badge && <span className={styles.newBadge}>{item.badge}</span>}
                                </div>
                                <p className={styles.cardDesc}>{item.description}</p>
                                <p className={styles.cardPro}>{item.pro}</p>
                            </div>
                            <ArrowRight size={18} className={styles.cardArrow} />
                        </Link>
                    ))}
                </div>

                <section className={styles.pricingTeaser}>
                    <div className={styles.pricingCard}>
                        <h3 className={styles.pricingTitle}>Free</h3>
                        <ul className={styles.featureList}>
                            {FREE_FEATURES.map(f => (
                                <li key={f} className={styles.featureItem}>
                                    <span className={styles.checkFree}>+</span> {f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup" className={styles.ctaFree}>Get Started Free</Link>
                    </div>

                    <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
                        <div className={styles.proTag}><Crown size={12} /> Pro</div>
                        <h3 className={styles.pricingTitle}>Everything in Free, plus:</h3>
                        <ul className={styles.featureList}>
                            {PRO_FEATURES.map(f => (
                                <li key={f} className={styles.featureItem}>
                                    <span className={styles.checkPro}>+</span> {f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/pricing" className={styles.ctaPro}>
                            <Crown size={14} /> Upgrade to Pro
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
