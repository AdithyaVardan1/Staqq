'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Wallet, Shield, Rocket, ArrowRight, Crown, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

/* ── Static suite data ── */
const SUITE = [
    {
        href: '/crypto/signals',
        icon: <Zap size={22} />,
        title: 'Social Signals',
        description: 'Tokens surging on Reddit and crypto Twitter before they hit mainstream. Real-time social velocity scoring.',
        badge: null,
        pro: '// real-time (6h delay for free)',
        color: '#22c55e',
    },
    {
        href: '/crypto/wallets',
        icon: <Wallet size={22} />,
        title: 'Wallet Tracker',
        description: 'Paste any ETH or Solana wallet address and see exactly what tokens they\'ve been buying. Follow smart money.',
        badge: null,
        pro: '// unlimited saves + email alerts (Pro)',
        color: '#a78bfa',
    },
    {
        href: '/crypto/scanner',
        icon: <Shield size={22} />,
        title: 'Token Scanner',
        description: 'Paste any contract address and get a full rugpull risk analysis: honeypot detection, holder concentration, LP locks.',
        badge: null,
        pro: '// free for all users',
        color: '#38bdf8',
    },
    {
        href: '/crypto/new-tokens',
        icon: <Rocket size={22} />,
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

/* ── Fallback ticker data (shown while fetching) ── */
const FALLBACK_TICKERS = [
    { symbol: 'BTC', name: 'Bitcoin',  price: 72300,  change: 2.4,  up: true  },
    { symbol: 'ETH', name: 'Ethereum', price: 247000, change: 1.8,  up: true  },
    { symbol: 'SOL', name: 'Solana',   price: 14820,  change: -0.6, up: false },
    { symbol: 'BNB', name: 'BNB',      price: 51200,  change: 0.9,  up: true  },
    { symbol: 'XRP', name: 'XRP',      price: 512,    change: -0.3, up: false },
    { symbol: 'DOGE', name: 'Dogecoin',price: 14.2,   change: 5.7,  up: true  },
    { symbol: 'AVAX', name: 'Avalanche',price: 3340,  change: 3.1,  up: true  },
    { symbol: 'MATIC',name: 'Polygon', price: 71.4,   change: -1.2, up: false },
];

/* Format INR price compactly */
function fmtINR(usd: number): string {
    const inr = usd * 84; // rough peg
    if (inr >= 10_00_000) return `₹${(inr / 1_00_000).toFixed(1)}L`;
    if (inr >= 1_000)     return `₹${Math.round(inr).toLocaleString('en-IN')}`;
    return `₹${inr.toFixed(2)}`;
}

type Ticker = { symbol: string; name: string; price: number; change: number; up: boolean };

/* ── Coin Gecko IDs → our symbols ── */
const CG_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,avalanche-2,matic-network';
const CG_SYMBOL_MAP: Record<string, string> = {
    bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB',
    ripple: 'XRP', dogecoin: 'DOGE', 'avalanche-2': 'AVAX', 'matic-network': 'MATIC',
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const cardVariants: any = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    show:  { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function CryptoHubPage() {
    const [tickers, setTickers] = useState<Ticker[]>(FALLBACK_TICKERS);
    const [tickerLive, setTickerLive] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchPrices = async () => {
        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${CG_IDS}&vs_currencies=usd&include_24hr_change=true`,
                { next: { revalidate: 60 } }
            );
            if (!res.ok) return;
            const data = await res.json();
            const next: Ticker[] = Object.entries(data).map(([id, val]: any) => ({
                symbol: CG_SYMBOL_MAP[id] ?? id.toUpperCase(),
                name:   FALLBACK_TICKERS.find(t => t.symbol === CG_SYMBOL_MAP[id])?.name ?? id,
                price:  val.usd,
                change: +(val.usd_24h_change ?? 0).toFixed(2),
                up:     (val.usd_24h_change ?? 0) >= 0,
            }));
            setTickers(next);
            setTickerLive(true);
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        } catch {
            // silently keep fallback
        }
    };

    useEffect(() => {
        fetchPrices();
        const id = setInterval(fetchPrices, 60_000); // refresh every minute
        return () => clearInterval(id);
    }, []);

    const doubled = [...tickers, ...tickers]; // seamless loop

    return (
        <main className={styles.main}>
            {/* ── Ambient orbs ── */}
            <div className={styles.orb1} aria-hidden />
            <div className={styles.orb2} aria-hidden />
            <div className={styles.orb3} aria-hidden />

            {/* ── Live Crypto Ticker Bar ── */}
            <div className={styles.tickerBar}>
                <div className={styles.tickerLiveTag}>
                    <span className={tickerLive ? styles.tickerLiveDot : styles.tickerLiveDotFallback} />
                    {tickerLive ? 'LIVE' : 'LOADING'}
                </div>
                <div className={styles.tickerScroll}>
                    <div className={styles.tickerInner}>
                        {doubled.map((t, i) => (
                            <div key={i} className={styles.tickerItem}>
                                <span className={styles.tickerSymbol}>{t.symbol}</span>
                                <span className={styles.tickerPrice}>{fmtINR(t.price)}</span>
                                <span className={t.up ? styles.tickerUp : styles.tickerDown}>
                                    {t.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {Math.abs(t.change).toFixed(2)}%
                                </span>
                                <span className={styles.tickerSep}>·</span>
                            </div>
                        ))}
                    </div>
                </div>
                {lastUpdated && (
                    <div className={styles.tickerTime}>
                        <RefreshCw size={10} />
                        {lastUpdated}
                    </div>
                )}
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                {/* ── Compact Feature-Page Header ── */}
                <motion.div
                    className={styles.pageHeader}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.pageBadge}>
                        <span className={styles.pageBadgeDot} />
                        Crypto Suite · 6 Chains
                    </div>
                    <h1 className={styles.pageTitle}>
                        Find gems. Avoid rugs.<br />
                        <span className={styles.accent}>Copy smart money.</span>
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Social signals, wallet intelligence, safety scanning, and new launch discovery — all in one place.
                    </p>
                </motion.div>

                {/* ── Stat strip ── */}
                <motion.div
                    className={styles.statStrip}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.25 }}
                >
                    {[
                        { num: '6',    label: 'Chains' },
                        { num: '12K+', label: 'Wallets Scanned' },
                        { num: '48h',  label: 'Avg Early Signal' },
                        { num: '94%',  label: 'Rug Detection' },
                    ].map((s, i, arr) => (
                        <>
                            <div key={s.label} className={styles.statItem}>
                                <span className={styles.statNum}>{s.num}</span>
                                <span className={styles.statLabel}>{s.label}</span>
                            </div>
                            {i < arr.length - 1 && <div key={`d${i}`} className={styles.statDivider} />}
                        </>
                    ))}
                </motion.div>

                {/* ── Suite Cards ── */}
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
                                    style={{ color: item.color, background: `${item.color}18`, boxShadow: `0 0 18px ${item.color}1a` }}
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
                                <ArrowRight size={16} className={styles.cardArrow} />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Pricing ── */}
                <motion.section
                    className={styles.pricingTeaser}
                    initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
                        <div className={styles.proTag}><Crown size={11} /> Pro</div>
                        <h3 className={styles.pricingTitle}>Everything in Free, plus:</h3>
                        <ul className={styles.featureList}>
                            {PRO_FEATURES.map(f => (
                                <li key={f} className={styles.featureItem}>
                                    <span className={styles.checkPro}>+</span> {f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/pricing" className={styles.ctaPro}>
                            <Crown size={13} /> Upgrade to Pro
                        </Link>
                    </div>
                </motion.section>

            </div>
        </main>
    );
}
