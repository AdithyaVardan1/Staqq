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

                {/* LEFT (primary) — opinion panels side by side */}
                <div className={styles.opinionCol}>
                    <div className={styles.opinionPane}>
                        <OpinionFeed
                            label="Social Opinion"
                            sublabel="AI synthesis of investor discussions"
                            pulses={socialPulses}
                            variant="social"
                        />
                    </div>
                    <div className={styles.opinionPane}>
                        <OpinionFeed
                            label="Media Opinion"
                            sublabel="AI synthesis of news coverage"
                            pulses={mediaPulses}
                            variant="media"
                        />
                    </div>
                </div>

                {/* RIGHT (secondary) — news sidebar */}
                <div className={styles.newsCol}>
                    <div className={styles.colHeader}>
                        <span className={styles.colDot} style={{ background: '#f59e0b' }} />
                        <span className={styles.colLabel}>Market Feed</span>
                        <span className={styles.colCount}>{newsPosts.length} articles · last 23h</span>
                    </div>

                    <MarketFeedAnimator
                        heroPost={heroPost}
                        gridPosts={gridPosts}
                        styles={styles}
                    />
                </div>

            </div>
        </main>
    );
}
