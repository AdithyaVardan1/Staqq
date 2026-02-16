'use client';

import React from 'react';
import { ArrowUpRight, MessageSquare, TrendingUp, Flame } from 'lucide-react';
import Link from 'next/link';
import type { SocialPost } from '@/lib/social';
import styles from './PostCard.module.css';

interface PostCardProps {
    post: SocialPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const formatDate = (timestamp: number) => {
        const now = Date.now();
        const diff = now - (timestamp * 1000);
        const mins = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const formatScore = (score: number) => {
        if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
        return score.toString();
    };

    const isReddit = post.source === 'reddit';

    return (
        <Link
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
        >
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.sourceInfo}>
                        <span className={`${styles.sourceIcon} ${isReddit ? styles.reddit : styles.twitter}`}>
                            {isReddit ? '🟠' : '𝕏'}
                        </span>
                        <span className={styles.community}>
                            {isReddit ? `r/${post.community}` : post.community}
                        </span>
                    </div>

                    {post.isHot && (
                        <span className={styles.hotBadge}>
                            <Flame size={12} />
                            HOT
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className={styles.title}>
                    {post.title}
                </h3>

                {/* Body preview */}
                {post.body && post.body !== post.title && (
                    <p className={styles.body}>
                        {post.body.slice(0, 160)}{post.body.length > 160 ? '…' : ''}
                    </p>
                )}

                {/* Media Image */}
                {post.image && (
                    <div className={styles.imageWrapper}>
                        <img
                            src={post.image}
                            alt="Post media"
                            className={styles.postImage}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Tickers */}
                {post.tickers.length > 0 && (
                    <div className={styles.tickers}>
                        {post.tickers.slice(0, 4).map((ticker) => (
                            <span key={ticker} className={styles.ticker}>
                                ${ticker}
                            </span>
                        ))}
                        {post.tickers.length > 4 && (
                            <span className={styles.moreTickers}>
                                +{post.tickers.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.stats}>
                        {post.score > 0 && (
                            <div className={styles.stat}>
                                <TrendingUp size={14} className={post.score > 100 ? styles.statGreen : styles.statDim} />
                                <span>{formatScore(post.score)}</span>
                            </div>
                        )}

                        {post.comments > 0 && (
                            <div className={styles.stat}>
                                <MessageSquare size={14} className={post.comments > 50 ? styles.statBlue : styles.statDim} />
                                <span>{post.comments}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.meta}>
                        {post.author && <span className={styles.author}>@{post.author}</span>}
                        <span>{formatDate(post.createdAt)}</span>
                        <ArrowUpRight size={14} className={styles.arrow} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
