'use client';

import Link from 'next/link';
import { Zap, Wallet, Shield, Rocket, ArrowRight, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

const SUITE = [
    {
        href: '/crypto/signals',
        icon: <Zap size={26} />,
        title: 'Social Signals',
        description: 'Tokens surging on Reddit and crypto Twitter before they hit mainstream. Real-time social velocity scoring.',
        badge: null,
        pro: '// real-time (6h delay for free)',
        color: '#22c55e',
    },
    {
        href: '/crypto/wallets',
        icon: <Wallet size={26} />,
        title: 'Wallet Tracker',
        description: 'Paste any ETH or Solana wallet address and see exactly what tokens they\'ve been buying. Follow smart money.',
        badge: null,
        pro: '// unlimited saves + email alerts (Pro)',
        color: '#a78bfa',
    },
    {
        href: '/crypto/scanner',
        icon: <Shield size={26} />,
        title: 'Token Scanner',
        description: 'Paste any contract address and get a full rugpull risk analysis: honeypot detection, holder concentration, LP locks.',
        badge: null,
        pro: '// free for all users',
        color: '#38bdf8',
    },
    {
        href: '/crypto/new-tokens',
        icon: <Rocket size={26} />,
        title: 'New Launches',
        description: 'Fresh token launches auto-scanned for safety. Filter by risk level and find gems before they go viral.',
        badge: 'New',
        pro: '// free to view, Pro for alerts',
        color: '#fb923c',
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

const TICKER_ITEMS = [
    { symbol: 'BTC', price: '₹72.3L', change: '+2.4%', up: true },
    { symbol: 'ETH', price: '₹2.47L', change: '+1.8%', up: true },
    { symbol: 'SOL', price: '₹14,820', change: '-0.6%', up: false },
    { symbol: 'BNB', price: '₹51,200', change: '+0.9%', up: true },
    { symbol: 'MATIC', price: '₹71.4', change: '-1.2%', up: false },
    { symbol: 'AVAX', price: '₹3,340', change: '+3.1%', up: true },
    { symbol: 'DOGE', price: '₹14.2', change: '+5.7%', up: true },
    { symbol: 'XRP', price: '₹512', change: '-0.3%', up: false },
];

const STATS = [
    { num: '6', label: 'Chains Tracked' },
    { num: '12K+', label: 'Wallets Scanned' },
    { num: '48h', label: 'Avg. Early Signal' },
    { num: '94%', label: 'Rug Detection Rate' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    show: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
};

export default function CryptoHubPage() {
    return (
        <main className={styles.main}>
            {/* Ambient orbs */}
            <div className={styles.orb1} aria-hidden />
            <div className={styles.orb2} aria-hidden />
            <div className={styles.orb3} aria-hidden />

            {/* Live price ticker */}
            <div className={styles.tickerBar}>
                <div className={styles.tickerInner}>
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                        <div key={i} className={styles.tickerItem}>
                            <span className={styles.tickerSymbol}>{t.symbol}</span>
                            <span>{t.price}</span>
                            <span className={t.up ? styles.tickerUp : styles.tickerDown}>
                                {t.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {t.change}
                            </span>
                            <span className={styles.tickerDot} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero */}
                <motion.section
                    className={styles.hero}
                    initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.heroRing} aria-hidden />
                    <div className={styles.heroRing2} aria-hidden />

                    <div className={styles.heroBadge}>
                        <span className={styles.heroBadgeDot} />
                        On-chain Intelligence · Live
                    </div>

                    <h1 className={styles.heroTitle}>
                        Find gems. Avoid rugs.<br />
                        <span className={styles.accent}>Copy smart money.</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Everything serious crypto traders need: social signals, wallet intelligence,
                        safety scanning, and new launch discovery — across 6 chains.
                    </p>
                </motion.section>

                {/* Stat Strip */}
                <motion.div
                    className={styles.statStrip}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    {STATS.map((s, i) => (
                        <>
                            <div key={s.label} className={styles.statItem} style={{ animationDelay: `${i * 0.1 + 0.4}s` }}>
                                <span className={styles.statNum}>{s.num}</span>
                                <span className={styles.statLabel}>{s.label}</span>
                            </div>
                            {i < STATS.length - 1 && <div key={`div-${i}`} className={styles.statDivider} />}
                        </>
                    ))}
                </motion.div>

                {/* Suite Cards */}
                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {SUITE.map(item => (
                        <motion.div key={item.href} variants={cardVariants}>
                            <Link href={item.href} className={styles.card}>
                                <div
                                    className={styles.cardIcon}
                                    style={{
                                        color: item.color,
                                        background: `${item.color}18`,
                                        boxShadow: `0 0 20px ${item.color}20`
                                    }}
                                >
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
                        </motion.div>
                    ))}
                </motion.div>

                {/* Pricing */}
                <motion.section
                    className={styles.pricingTeaser}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
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
                </motion.section>
            </div>
        </main>
    );
}
