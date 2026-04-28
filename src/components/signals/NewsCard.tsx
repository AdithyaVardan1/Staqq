'use client';

import Link from 'next/link';
import type { SocialPost } from '@/lib/social';
import styles from './NewsCard.module.css';

interface NewsCardProps {
    post: SocialPost;
    size?: 'hero' | 'regular';
}

function timeAgo(ts: number): string {
    if (!ts || isNaN(ts)) return 'just now';
    const diff = Date.now() - ts * 1000;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const SOURCE_COLORS: Record<string, string> = {
    'LiveMint':      '#f59e0b',
    'BusinessLine':  '#6366f1',
    'Economic Times':'#3b82f6',
};

export function NewsCard({ post, size = 'regular' }: NewsCardProps) {
    const accentColor = SOURCE_COLORS[post.community] || '#888';
    const initial = (post.community || 'N')[0].toUpperCase();

    return (
        <Link href={post.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <article
                className={`${styles.card} ${size === 'hero' ? styles.hero : ''}`}
                style={{ '--accent': accentColor } as React.CSSProperties}
            >
                {/* Skewed background layer */}
                <div className={styles.bg} />

                <div className={styles.inner}>
                    {/* Source */}
                    <div className={styles.source}>
                        <span className={styles.sourceIcon} style={{ background: `${accentColor}18`, color: accentColor }}>
                            {initial}
                        </span>
                        <span className={styles.sourceName}>{post.community}</span>
                        <span className={styles.time}>{timeAgo(post.createdAt)}</span>
                    </div>

                    {/* Headline */}
                    <h3 className={styles.headline}>{post.title}</h3>

                    {/* Body excerpt */}
                    {post.body && (
                        <p className={styles.body}>
                            {post.body.slice(0, size === 'hero' ? 200 : 110)}
                            {post.body.length > (size === 'hero' ? 200 : 110) ? '…' : ''}
                        </p>
                    )}

                    {/* Tickers */}
                    {post.tickers.length > 0 && (
                        <div className={styles.tickers}>
                            {post.tickers.slice(0, 3).map(t => (
                                <span key={t} className={styles.ticker}>${t}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dog-ear cut corner */}
                <span className={styles.corner} style={{ '--accent': accentColor } as React.CSSProperties} />
            </article>
        </Link>
    );
}
