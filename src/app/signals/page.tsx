import React from 'react';
import Link from 'next/link';
import { getAllPosts, getSocialPulses, getNewsPulses } from '@/lib/social';
import { createAdminClient } from '@/utils/supabase/admin';
import { NewsCard } from '@/components/signals/NewsCard';
import { MarketFeedAnimator } from '@/components/signals/MarketFeedAnimator';
import { OpinionFeed } from '@/components/signals/OpinionFeed';
import { SignalDelayBanner } from '@/components/premium/SignalDelayBanner';
import { Zap } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 30;

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
    const [newsPosts, socialPulses, mediaPulses] = await Promise.all([
        getAllPosts(),
        getSocialPulses(8),
        getNewsPulses(8),
    ]);

    let recentSpikes: any[] = [];
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('alerts')
            .select('ticker, spike_mult, mention_count, detected_at')
            .gte('detected_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
            .order('spike_mult', { ascending: false })
            .limit(5);
        recentSpikes = data || [];
    } catch {}

    // Hero card = most recent post, rest fill the grid
    const [heroPost, ...gridPosts] = newsPosts;

    return (
        <main className={styles.page}>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 className={styles.shimmerTitle} style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
                    Market Intelligence
                </h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                    Real-time signals, social buzz, and alternative data for the smart investor.
                </p>
            </div>

            {/* Spike banner */}
            {recentSpikes.length > 0 && (
                <div className={styles.spikeBanner}>
                    <Zap size={14} style={{ color: '#caff00', flexShrink: 0 }} />
                    <span className={styles.spikeLabel}>
                        <span className={styles.spikeDot} />
                        Live Spikes
                    </span>
                    {recentSpikes.map((s, i) => (
                        <Link key={i} href={`/stocks/${s.ticker}`} className={styles.spikeChip}>
                            <span>${s.ticker}</span>
                            <span className={styles.spikeMult}>{s.spike_mult}x</span>
                        </Link>
                    ))}
                    <Link href="/alerts" className={styles.spikeSetup}>Set up alerts</Link>
                </div>
            )}

            <SignalDelayBanner />

            {/* ── Main split layout ── */}
            <div className={styles.layout}>

                {/* LEFT — news cards */}
                <div className={styles.newsCol}>
                    <div className={styles.colHeader}>
                        <span className={styles.colDot} style={{ background: '#f59e0b' }} />
                        <span className={styles.colLabel}>Market Feed</span>
                        <span className={styles.colCount}>{newsPosts.length} articles</span>
                    </div>

                    <MarketFeedAnimator 
                        heroPost={heroPost} 
                        gridPosts={gridPosts} 
                        styles={styles} 
                    />
                </div>

                {/* RIGHT — opinion panels stacked */}
                <div className={styles.opinionCol} style={{ animation: 'heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.3s' }}>

                    {/* Social opinion — top half */}
                    <div className={styles.opinionPane}>
                        <OpinionFeed
                            label="Social Opinion"
                            sublabel="AI synthesis of investor discussions"
                            pulses={socialPulses}
                            variant="social"
                        />
                    </div>

                    {/* Divider */}
                    <div className={styles.paneDivider} />

                    {/* Media opinion — bottom half */}
                    <div className={styles.opinionPane}>
                        <OpinionFeed
                            label="Media Opinion"
                            sublabel="AI synthesis of news coverage"
                            pulses={mediaPulses}
                            variant="media"
                        />
                    </div>
                </div>

            </div>
        </main>
    );
}
