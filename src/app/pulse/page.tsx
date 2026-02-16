import React from 'react';
import { getAllPosts } from '@/lib/social';
import type { SocialPost } from '@/lib/social';
import PostCard from '@/components/alerts/PostCard';
import { Activity } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 300;

export default async function PulsePage() {
    const allPosts = await getAllPosts();

    const redditPosts = allPosts.filter(p => p.source === 'reddit');
    const twitterPosts = allPosts.filter(p => p.source === 'twitter');
    const hotPosts = allPosts.filter(p => p.isHot);

    const subredditCounts = redditPosts.reduce((acc, p) => {
        acc[p.community] = (acc[p.community] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <main className={styles.page}>
            {/* Header */}
            <section className={styles.hero}>
                <h1 className={styles.title}>
                    Market <span className={styles.accent}>Pulse</span>
                </h1>
                <p className={styles.subtitle}>
                    Live stock market discussions from Reddit & X track sentiment, spot trends, make moves.
                </p>

                <div className={styles.stats}>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{allPosts.length}</span>
                        <span className={styles.pillLabel}>Posts</span>
                    </div>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{hotPosts.length}</span>
                        <span className={styles.pillLabel}>🔥 Hot</span>
                    </div>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{redditPosts.length}</span>
                        <span className={styles.pillLabel}>Reddit</span>
                    </div>
                    <div className={styles.pill}>
                        <span className={styles.pillNum}>{twitterPosts.length}</span>
                        <span className={styles.pillLabel}>X</span>
                    </div>
                </div>

                <div className={styles.badges}>
                    {Object.entries(subredditCounts).map(([sub, count]) => (
                        <span key={sub} className={styles.badge}>
                            🟠 r/{sub} <strong>{count}</strong>
                        </span>
                    ))}
                    {twitterPosts.length > 0 && (
                        <span className={styles.badge}>
                            𝕏 Twitter <strong>{twitterPosts.length}</strong>
                        </span>
                    )}
                </div>
            </section>

            {/* Posts */}
            {allPosts.length > 0 ? (
                <section className={styles.feed}>
                    {allPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </section>
            ) : (
                <section className={styles.empty}>
                    <Activity className={styles.emptyIcon} />
                    <h3>Fetching Market Pulse…</h3>
                    <p>We&apos;re pulling the latest stock market discussions. This page auto-refreshes every 5 minutes.</p>
                </section>
            )}
        </main>
    );
}
