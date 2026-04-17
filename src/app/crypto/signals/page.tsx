'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Zap, Lock, TrendingUp, TrendingDown, ArrowUpRight,
    RefreshCw, ExternalLink, Clock, Users, BarChart2, Shield
} from 'lucide-react';
import type { CryptoSignal } from '@/lib/crypto-signals';
import { useSubscription } from '@/hooks/useSubscription';
import styles from './page.module.css';

const SIGNAL_TYPE_LABELS: Record<string, string> = {
    combined: 'Social + Volume',
    social_surge: 'Social Surge',
    volume_spike: 'Volume Spike',
};

const SIGNAL_TYPE_COLORS: Record<string, string> = {
    combined: '#a78bfa',
    social_surge: '#22c55e',
    volume_spike: '#f97316',
};

const CHAIN_LABELS: Record<string, string> = {
    ethereum: 'ETH',
    bsc: 'BSC',
    solana: 'SOL',
    base: 'Base',
    polygon: 'MATIC',
    arbitrum: 'ARB',
    unknown: '?',
};

function timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function formatPrice(price: number | null): string {
    if (!price) return '-';
    if (price < 0.0001) return `$${price.toExponential(2)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    return `$${(price / 1000).toFixed(1)}k`;
}

function formatVolume(vol: number | null): string {
    if (!vol) return '-';
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 70 ? '#a78bfa' : score >= 50 ? '#22c55e' : score >= 30 ? '#f97316' : '#64748b';
    return (
        <div className={styles.scoreBadge} style={{ borderColor: color, color }}>
            <Zap size={11} />
            {score}
        </div>
    );
}

function LockedCard({ signal }: { signal: CryptoSignal }) {
    return (
        <div className={`${styles.signalCard} ${styles.lockedCard}`}>
            <div className={styles.lockedOverlay}>
                <Lock size={20} />
                <span className={styles.lockedText}>Signal fired {timeAgo(signal.firstDetectedAt)}</span>
                <Link href="/pricing" className={styles.unlockBtn}>
                    Unlock real-time signals
                </Link>
            </div>
            <div className={styles.lockedBlur}>
                <div className={styles.cardTop}>
                    <div className={styles.tokenInfo}>
                        <span className={styles.tokenSymbol}>████</span>
                        <span className={styles.chainBadge}>???</span>
                    </div>
                    <ScoreBadge score={signal.socialScore} />
                </div>
                <div className={styles.cardStats}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Price</span>
                        <span className={styles.statVal}>$?.???</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>1h</span>
                        <span className={`${styles.statVal} ${styles.up}`}>+?.??%</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Volume 24h</span>
                        <span className={styles.statVal}>$?.??M</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignalCard({ signal }: { signal: CryptoSignal }) {
    const change1h = signal.priceChange1h;
    const change24h = signal.priceChange24h;
    const typeColor = SIGNAL_TYPE_COLORS[signal.signalType] || '#a78bfa';

    return (
        <div className={styles.signalCard}>
            <div className={styles.cardTop}>
                <div className={styles.tokenInfo}>
                    <span className={styles.tokenSymbol}>${signal.tokenSymbol}</span>
                    {signal.tokenName && signal.tokenName !== signal.tokenSymbol && (
                        <span className={styles.tokenName}>{signal.tokenName}</span>
                    )}
                    <span className={styles.chainBadge}>
                        {CHAIN_LABELS[signal.chain] || signal.chain.toUpperCase()}
                    </span>
                </div>
                <ScoreBadge score={signal.socialScore} />
            </div>

            <div className={styles.signalTypeBadge} style={{ color: typeColor, borderColor: `${typeColor}40` }}>
                <Zap size={11} />
                {SIGNAL_TYPE_LABELS[signal.signalType]}
            </div>

            <div className={styles.cardStats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Price</span>
                    <span className={styles.statVal}>{formatPrice(signal.priceUsd)}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>1h Change</span>
                    <span className={`${styles.statVal} ${change1h !== null && change1h > 0 ? styles.up : change1h !== null && change1h < 0 ? styles.down : ''}`}>
                        {change1h !== null
                            ? <>{change1h > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {change1h > 0 ? '+' : ''}{change1h.toFixed(2)}%</>
                            : '-'
                        }
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>24h Change</span>
                    <span className={`${styles.statVal} ${change24h !== null && change24h > 0 ? styles.up : change24h !== null && change24h < 0 ? styles.down : ''}`}>
                        {change24h !== null ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : '-'}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Volume 24h</span>
                    <span className={styles.statVal}>{formatVolume(signal.volume24h)}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Mentions</span>
                    <span className={styles.statVal}>
                        <Users size={11} /> {signal.mentionCount}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Velocity</span>
                    <span className={`${styles.statVal} ${styles.up}`}>
                        {signal.mentionVelocity.toFixed(1)}x
                    </span>
                </div>
            </div>

            {/* Top post */}
            {signal.topPosts?.[0] && (
                <a
                    href={signal.topPosts[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.topPost}
                >
                    <span className={styles.topPostTitle}>{signal.topPosts[0].title.slice(0, 80)}{signal.topPosts[0].title.length > 80 ? '...' : ''}</span>
                    <ExternalLink size={11} className={styles.topPostIcon} />
                </a>
            )}

            <div className={styles.cardFooter}>
                <span className={styles.detectedAt}>
                    <Clock size={11} />
                    {timeAgo(signal.firstDetectedAt)}
                </span>
                {signal.dexUrl && (
                    <a href={signal.dexUrl} target="_blank" rel="noopener noreferrer" className={styles.dexLink}>
                        DexScreener <ArrowUpRight size={11} />
                    </a>
                )}
                <Link href={`/rugpull?address=${signal.contractAddress || ''}&chain=${signal.chain}`} className={styles.rugLink}>
                    <Shield size={11} /> Rug Check
                </Link>
            </div>
        </div>
    );
}

export default function CryptoSignalsPage() {
    const [signals, setSignals] = useState<CryptoSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [filter, setFilter] = useState<'all' | 'combined' | 'social_surge' | 'volume_spike'>('all');
    const { isPro: _isPro } = useSubscription();
    const isPro = true; // DEMO: remove this line before production

    const DELAY_HOURS = 6;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/crypto/signals');
            const data = await res.json();
            const raw: CryptoSignal[] = data.signals || [];

            // Apply delay wall on client for free users
            const cutoff = new Date(Date.now() - DELAY_HOURS * 60 * 60 * 1000).toISOString();
            const withLock = raw.map(s => ({
                ...s,
                isLocked: !isPro && s.firstDetectedAt > cutoff,
            }));

            setSignals(withLock);
            setLastRefresh(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [isPro]);

    useEffect(() => {
        load();
        const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
        return () => clearInterval(interval);
    }, [load]);

    const filtered = filter === 'all' ? signals : signals.filter(s => s.signalType === filter);
    const liveCount = signals.filter(s => !s.isLocked).length;
    const lockedCount = signals.filter(s => s.isLocked).length;

    return (
        <main className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <h1 className={styles.title}>
                    Crypto <span className={styles.accent}>Signals</span>
                </h1>
                <p className={styles.subtitle}>
                    Real-time social surge + volume spike detection across 7 crypto subreddits.
                    Catch the move before the crowd.
                </p>

                <div className={styles.heroBadges}>
                    <span className={styles.heroBadge}>
                        <Zap size={13} /> {signals.length} signals detected
                    </span>
                    {lockedCount > 0 && !isPro && (
                        <span className={`${styles.heroBadge} ${styles.lockedBadge}`}>
                            <Lock size={13} /> {lockedCount} locked (Pro)
                        </span>
                    )}
                    {lastRefresh && (
                        <span className={styles.heroBadge}>
                            <Clock size={13} /> Updated {timeAgo(lastRefresh.toISOString())}
                        </span>
                    )}
                </div>
            </section>

            {/* Pro banner for free users */}
            {!isPro && lockedCount > 0 && (
                <div className={styles.proBanner}>
                    <div className={styles.proBannerLeft}>
                        <Lock size={18} className={styles.proBannerIcon} />
                        <div>
                            <strong>{lockedCount} signals are locked</strong>
                            <span> — You're seeing signals from {DELAY_HOURS}+ hours ago. Pro users get them the moment they fire.</span>
                        </div>
                    </div>
                    <Link href="/pricing" className={styles.proBannerCta}>
                        Go Pro — $19/mo
                    </Link>
                </div>
            )}

            {/* Filters */}
            <div className={styles.filters}>
                {(['all', 'combined', 'social_surge', 'volume_spike'] as const).map(f => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All Signals' : SIGNAL_TYPE_LABELS[f]}
                    </button>
                ))}
                <button
                    className={styles.refreshBtn}
                    onClick={load}
                    disabled={loading}
                    title="Refresh"
                >
                    <RefreshCw size={14} className={loading ? styles.spinning : ''} />
                </button>
            </div>

            {/* Feed */}
            {loading && signals.length === 0 ? (
                <div className={styles.loadingGrid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>
                    <BarChart2 size={40} className={styles.emptyIcon} />
                    <h3>Scanning for signals...</h3>
                    <p>No strong signals detected right now. Check back in a few minutes.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filtered.map(signal =>
                        signal.isLocked
                            ? <LockedCard key={signal.id} signal={signal} />
                            : <SignalCard key={signal.id} signal={signal} />
                    )}
                </div>
            )}

            {/* How it works */}
            <section className={styles.howSection}>
                <h2 className={styles.howTitle}>How signals are detected</h2>
                <div className={styles.howGrid}>
                    <div className={styles.howCard}>
                        <span className={styles.howIcon}>📡</span>
                        <strong>Social Scanning</strong>
                        <p>7 crypto subreddits scanned every 5 minutes for token mentions and velocity spikes</p>
                    </div>
                    <div className={styles.howCard}>
                        <span className={styles.howIcon}>📊</span>
                        <strong>Volume Cross-check</strong>
                        <p>DexScreener data confirms if on-chain volume is also spiking alongside social buzz</p>
                    </div>
                    <div className={styles.howCard}>
                        <span className={styles.howIcon}>⚡</span>
                        <strong>Real-time for Pro</strong>
                        <p>Free users see signals 6 hours late. Pro users get notified the moment a signal fires</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
