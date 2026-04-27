'use client';

import type { MarketPulse } from '@/lib/social';
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
    neutral: '#666',
    mixed:   '#f59e0b',
};

const SENTIMENT_BG: Record<string, string> = {
    bullish: 'rgba(202,255,0,0.06)',
    bearish: 'rgba(239,68,68,0.06)',
    neutral: 'rgba(255,255,255,0.03)',
    mixed:   'rgba(245,158,11,0.06)',
};

import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, rotateX: -15, y: 15, filter: 'blur(3px)', transformPerspective: 800 },
    show: { 
        opacity: 1, 
        rotateX: 0, 
        y: 0, 
        filter: 'blur(0px)',
        transition: { 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export function OpinionFeed({ label, sublabel, pulses, variant }: OpinionFeedProps) {
    const accentColor = variant === 'social' ? '#caff00' : '#6366f1';

    return (
        <div className={styles.panel}>
            {/* Panel header */}
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

            {/* Feed */}
            <div className={styles.feed}>
                {pulses.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyPulse} style={{ '--accent': accentColor } as React.CSSProperties} />
                        <span>Analysis incoming...</span>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className={styles.feedInner}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                        {pulses.map((pulse, i) => {
                            const sc = SENTIMENT_COLOR[pulse.sentiment] || '#888';

                            return (
                                <motion.div
                                    key={pulse.id}
                                    variants={itemVariants}
                                    className={styles.entry}
                                    style={{
                                        '--sc': sc,
                                        '--sbg': SENTIMENT_BG[pulse.sentiment] || 'rgba(255,255,255,0.03)',
                                    } as React.CSSProperties}
                                >
                                    {/* Skewed shell */}
                                    <div className={styles.entryShell}>
                                        {/* Counter-skewed content */}
                                        <div className={styles.entryContent}>
                                            <div className={styles.entryTop}>
                                                <span className={styles.sentimentDot} style={{ background: sc }} />
                                                <span className={styles.sentimentLabel} style={{ color: sc }}>
                                                    {pulse.sentiment}
                                                </span>
                                                {pulse.ticker && (
                                                    <span className={styles.ticker}>${pulse.ticker}</span>
                                                )}
                                                <span className={styles.date}>{pulse.date}</span>
                                            </div>
                                            <p className={styles.headline}>{pulse.headline}</p>
                                            <p className={styles.summary}>
                                                {pulse.summary.slice(0, 130)}
                                                {pulse.summary.length > 130 ? '…' : ''}
                                            </p>
                                            {pulse.topics.length > 0 && (
                                                <div className={styles.topics}>
                                                    {pulse.topics.slice(0, 3).map(t => (
                                                        <span key={t} className={styles.topic}>{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Fade-out veil at the bottom */}
                <div className={styles.veil} />
            </div>
        </div>
    );
}
