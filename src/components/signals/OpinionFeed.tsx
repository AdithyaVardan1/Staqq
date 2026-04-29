'use client';

import type { MarketPulse } from '@/lib/social';
import { motion } from 'framer-motion';
import styles from './OpinionFeed.module.css';

interface OpinionFeedProps {
    label: string;
    sublabel: string;
    pulses: MarketPulse[];
    variant: 'social' | 'media';
}

const SENTIMENT_COLOR: Record<string, string> = {
    bullish: '#caff00',
    bearish: '#ef4444',
    neutral: '#888',
    mixed:   '#f59e0b',
};

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const item: any = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function OpinionFeed({ label, sublabel, pulses, variant }: OpinionFeedProps) {
    const accentColor = variant === 'social' ? '#caff00' : '#818cf8';

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.dot} style={{ background: accentColor }} />
                    <span className={styles.label}>{label}</span>
                    <span className={`${styles.badge} ${styles[variant]}`}>
                        {variant === 'social' ? 'Reddit' : 'News'}
                    </span>
                </div>
                <span className={styles.sublabel}>{sublabel}</span>
            </div>

            <div className={styles.feed}>
                {pulses.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyDot} style={{ background: accentColor }} />
                        <span>Analysis incoming...</span>
                    </div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show">
                        {pulses.map((pulse) => {
                            const sc = SENTIMENT_COLOR[pulse.sentiment] || '#888';
                            return (
                                <motion.div
                                    key={pulse.id}
                                    variants={item}
                                    className={styles.card}
                                    style={{ '--sc': sc } as React.CSSProperties}
                                >
                                    <div className={styles.cardTop}>
                                        <span className={styles.sentimentTag} style={{ color: sc }}>
                                            {pulse.sentiment}
                                        </span>
                                        {pulse.ticker && (
                                            <span className={styles.ticker}>${pulse.ticker}</span>
                                        )}
                                        <span className={styles.date}>{pulse.date}</span>
                                    </div>
                                    <p className={styles.headline}>{pulse.headline}</p>
                                    <p className={styles.summary}>{pulse.summary}</p>
                                    {pulse.topics.length > 0 && (
                                        <div className={styles.topics}>
                                            {pulse.topics.slice(0, 3).map(t => (
                                                <span key={t} className={styles.topic}>{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
