'use client';

import type { MarketPulse } from '@/lib/social';
import styles from './PulseCard.module.css';

interface PulseCardProps {
    pulse: MarketPulse;
}

const SENTIMENT_LABEL: Record<MarketPulse['sentiment'], string> = {
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
    mixed: 'Mixed',
};

export function PulseCard({ pulse }: PulseCardProps) {
    const sentimentClass = styles[`sentiment_${pulse.sentiment}`];

    return (
        <div className={`${styles.card} ${sentimentClass}`}>
            <div className={styles.header}>
                <div className={styles.meta}>
                    {pulse.ticker ? (
                        <span className={styles.ticker}>${pulse.ticker}</span>
                    ) : (
                        <span className={styles.general}>Market Overview</span>
                    )}
                    <span className={`${styles.sentimentBadge} ${sentimentClass}`}>
                        {SENTIMENT_LABEL[pulse.sentiment]}
                    </span>
                </div>
                <span className={styles.postCount}>
                    {pulse.postCount} discussions
                </span>
            </div>

            <h3 className={styles.headline}>{pulse.headline}</h3>
            <p className={styles.summary}>{pulse.summary}</p>

            {pulse.topics.length > 0 && (
                <div className={styles.topics}>
                    {pulse.topics.slice(0, 5).map(topic => (
                        <span key={topic} className={styles.topic}>{topic}</span>
                    ))}
                </div>
            )}

            <div className={styles.footer}>
                <span className={styles.aiLabel}>AI synthesized · Updated daily</span>
                <div className={styles.scoreBar}>
                    <div
                        className={styles.scoreFill}
                        style={{ width: `${Math.abs(pulse.sentimentScore)}%` }}
                        data-sentiment={pulse.sentiment}
                    />
                </div>
            </div>
        </div>
    );
}
