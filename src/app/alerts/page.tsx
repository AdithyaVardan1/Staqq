'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useSubscription } from '@/hooks/useSubscription';
import { UsageMeter } from '@/components/premium/UsageMeter';
import { UpgradeModal } from '@/components/premium/UpgradeModal';
import styles from './page.module.css';

interface Subscription {
    ticker: string;
    is_active: boolean;
    created_at: string;
}

export default function AlertsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const { notifications, fetch: fetchNotifs } = useNotificationsStore();
    const { isFree, features } = useSubscription();

    const fetchSubs = useCallback(async () => {
        try {
            const res = await fetch('/api/alerts/subscriptions');
            const data = await res.json();
            setSubscriptions(data.subscriptions ?? []);
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSubs();
        fetchNotifs();
    }, [fetchSubs, fetchNotifs]);

    const hasAll = subscriptions.some(s => s.ticker === 'ALL');

    const toggleAll = async () => {
        setActionLoading('ALL');
        const endpoint = hasAll ? '/api/alerts/unsubscribe' : '/api/alerts/subscribe';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: 'ALL' }),
            });
            if (res.status === 403) {
                setShowUpgrade(true);
                return;
            }
            if (res.ok) await fetchSubs();
        } finally {
            setActionLoading(null);
        }
    };

    const unsubscribe = async (ticker: string) => {
        setActionLoading(ticker);
        try {
            const res = await fetch('/api/alerts/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker }),
            });
            if (res.ok) await fetchSubs();
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return formatDate(dateStr);
    };

    const tickerSubs = subscriptions.filter(s => s.ticker !== 'ALL');

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <h1 className={styles.title}>
                    Spike <span className={styles.accent}>Alerts</span>
                </h1>
                <p className={styles.subtitle}>
                    Get notified when stocks suddenly explode on Reddit. Manage your alert subscriptions and view recent spikes.
                </p>
            </section>

            <div className={styles.content}>
                {/* Subscribe to ALL toggle */}
                <div className={styles.allToggle}>
                    <div className={styles.allToggleText}>
                        <span className={styles.allToggleLabel}>
                            {hasAll ? 'Subscribed to all tickers' : 'Subscribe to all tickers'}
                        </span>
                        <span className={styles.allToggleDesc}>
                            Get alerted whenever any stock spikes on Reddit
                        </span>
                    </div>
                    <Button
                        variant={hasAll ? 'primary' : 'outline'}
                        size="sm"
                        onClick={toggleAll}
                        isLoading={actionLoading === 'ALL'}
                    >
                        {hasAll
                            ? <><BellOff size={14} className="mr-2" />Unsubscribe</>
                            : <><Bell size={14} className="mr-2" />Subscribe</>
                        }
                    </Button>
                </div>

                {/* Alert subscription usage meter for free users */}
                {isFree && !loading && (
                    <UsageMeter
                        current={tickerSubs.length}
                        limit={features.max_alert_subs}
                        label="alert subscriptions"
                        showUpgrade={true}
                    />
                )}

                {/* Active subscriptions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Bell size={18} /> Active Subscriptions
                    </h2>

                    {loading ? (
                        <div className={styles.empty}>Loading...</div>
                    ) : tickerSubs.length === 0 ? (
                        <div className={styles.empty}>
                            No ticker-specific subscriptions yet. Visit any stock page and click &quot;Alert Me&quot; to subscribe.
                        </div>
                    ) : (
                        <div className={styles.subList}>
                            {tickerSubs.map(sub => (
                                <div key={sub.ticker} className={styles.subItem}>
                                    <div>
                                        <div className={styles.subTicker}>${sub.ticker}</div>
                                        <div className={styles.subDate}>Since {formatDate(sub.created_at)}</div>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => unsubscribe(sub.ticker)}
                                        disabled={actionLoading === sub.ticker}
                                    >
                                        {actionLoading === sub.ticker ? '...' : 'Remove'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent alerts */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Activity size={18} /> Recent Alerts
                    </h2>

                    {notifications.length === 0 ? (
                        <div className={styles.empty}>
                            No spike alerts yet. When a subscribed ticker surges on Reddit, it will appear here.
                        </div>
                    ) : (
                        <div>
                            {notifications.map(n => (
                                <div key={n.id} className={styles.alertItem}>
                                    <div className={styles.alertHeader}>
                                        <span className={styles.alertTicker}>${n.alert.ticker}</span>
                                        <span className={styles.alertMult}>{n.alert.spike_mult}x</span>
                                    </div>
                                    <div className={styles.alertMsg}>
                                        {n.alert.mention_count} mentions in 15 min &middot; {n.alert.spike_mult}x above 24h average
                                    </div>
                                    <div className={styles.alertTime}>
                                        {formatTime(n.alert.detected_at)}
                                        {n.alert.top_post_url && (
                                            <>
                                                {' '}&middot;{' '}
                                                <a
                                                    href={n.alert.top_post_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.alertLink}
                                                >
                                                    View top post
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                feature="Unlimited alert subscriptions"
            />
        </main>
    );
}
