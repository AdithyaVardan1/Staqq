import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/social';
import { createAdminClient } from '@/utils/supabase/admin';
import PostCard from '@/components/alerts/PostCard';
import { SignalDelayBanner } from '@/components/premium/SignalDelayBanner';
import { SignalNav } from '@/components/signals/SignalNav';
import { Activity, Zap } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 300;

export const metadata = {
    title: 'Market Signals | Staqq',
    description: 'Social sentiment, FII/DII flows, insider trades, and alternative data signals for Indian stocks.',
    openGraph: {
        title: 'Market Signals | Staqq',
        description: 'Social sentiment, FII/DII flows, insider trades, and alternative data signals for Indian stocks.',
        images: ['/api/og?title=Market+Signals&subtitle=Social+sentiment,+FII/DII+flows,+insider+trades+%26+alternative+data'],
    },
    twitter: {
        card: 'summary_large_image' as const,
        title: 'Market Signals | Staqq',
        images: ['/api/og?title=Market+Signals&subtitle=Social+sentiment,+FII/DII+flows,+insider+trades+%26+alternative+data'],
    },
};

export default async function SignalsPage() {
    const allPosts = await getAllPosts(50);

    // Fetch recent spikes (last 2 hours)
    let recentSpikes: any[] = [];
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('alerts')
            .select('ticker, spike_mult, mention_count, message, detected_at, top_post_url')
            .gte('detected_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
            .order('spike_mult', { ascending: false })
            .limit(5);
        recentSpikes = data || [];
    } catch {}

    const newsPosts = allPosts.filter(p => p.source === 'news');
    const twitterPosts = allPosts.filter(p => p.source === 'twitter');
    const hotPosts = allPosts.filter(p => p.isHot);

    const sourceCounts = newsPosts.reduce((acc, p) => {
        acc[p.community] = (acc[p.community] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <main className={styles.page}>
            <div className="container">
                <SignalNav />
            </div>

            {/* Spike banner */}
            {recentSpikes.length > 0 && (
                <section className={styles.spikeBanner}>
                    <div className={styles.spikeBannerHeader}>
                        <Zap size={16} className={styles.spikeIcon} />
                        <span className={styles.spikeBannerTitle}>Live Spikes</span>
                        <Link href="/alerts" className={styles.spikeManageLink}>Set up alerts</Link>
                    </div>
                    <div className={styles.spikeCards}>
                        {recentSpikes.map((spike, i) => (
                            <Link
                                key={i}
                                href={`/stocks/${spike.ticker}`}
                                className={styles.spikeCard}
                            >
                                <span className={styles.spikeTicker}>${spike.ticker}</span>
                                <span className={styles.spikeMult}>{spike.spike_mult}x</span>
                                <span className={styles.spikeMentions}>{spike.mention_count} mentions</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Header */}
            <section className={styles.hero}>
                <h1 className={styles.title}>
                    Market <span className={styles.accent}>Feed</span>
                </h1>
                <p className={styles.subtitle}>
                    Live market news from LiveMint, NDTV Profit, BusinessLine, and X/Twitter.
                </p>

                <div className={styles.stats}>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{allPosts.length}</span>
                        <span className={styles.pillLabel}>Articles</span>
                    </div>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{newsPosts.length}</span>
                        <span className={styles.pillLabel}>News</span>
                    </div>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{twitterPosts.length}</span>
                        <span className={styles.pillLabel}>X</span>
                    </div>
                </div>

                <div className={styles.badges}>
                    {Object.entries(sourceCounts).map(([source, count]) => (
                        <span key={source} className={styles.subredditBadge}>
                            {source} <strong>{count}</strong>
                        </span>
                    ))}
                    {twitterPosts.length > 0 && (
                        <span className={styles.subredditBadge}>
                            X / Twitter <strong>{twitterPosts.length}</strong>
                        </span>
                    )}
                </div>
            </section>

            {/* Delay banner for free users */}
            <SignalDelayBanner />

            {/* Posts Feed */}
            {allPosts.length > 0 ? (
                <section className={styles.feed}>
                    {allPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </section>
            ) : (
                <section className={styles.empty}>
                    <Activity className={styles.emptyIcon} />
                    <h3>Fetching Market Signals…</h3>
                    <p>Pulling the latest stock market discussions. This page auto-refreshes every 5 minutes.</p>
                </section>
            )}
        </main>
    );
}
