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
                    pulses.map((pulse, i) => {
                        const sc = SENTIMENT_COLOR[pulse.sentiment] || '#888';
                        const opacity = Math.max(0.18, 1 - i * 0.2);

                        return (
                            <div
                                key={pulse.id}
                                className={styles.entry}
                                style={{
                                    '--sc': sc,
                                    '--sbg': SENTIMENT_BG[pulse.sentiment] || 'rgba(255,255,255,0.03)',
                                    opacity,
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
                            </div>
                        );
                    })
                )}

                {/* Fade-out veil at the bottom */}
                <div className={styles.veil} />
            </div>
        </div>
    );
}
