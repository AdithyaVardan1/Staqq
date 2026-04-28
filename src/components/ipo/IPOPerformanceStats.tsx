'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Award, Users, Layers } from 'lucide-react';
import type { CategoryStats } from '@/lib/ipoAnalytics';
import styles from './IPOPerformanceStats.module.css';

interface IPOPerformanceStatsProps {
    allStats: CategoryStats;
    mainboardStats: CategoryStats;
    smeStats: CategoryStats;
}

const cardVariants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    sub: string;
    accentColor?: string;
}

function StatCard({ icon, label, value, sub, accentColor = 'rgba(202,255,0,0.06)' }: StatCardProps) {
    return (
        <motion.div
            className={styles.card}
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
        >
            {/* Subtle top-border glow line on hover */}
            <motion.div
                className={styles.topLine}
                variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { scaleX: 1, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
                }}
            />

            <div className={styles.cardLabel}>
                <span className={styles.cardIcon}>{icon}</span>
                {label}
            </div>

            <motion.div
                className={styles.cardValue}
                variants={{
                    rest: { y: 0 },
                    hover: { y: -2, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
                }}
            >
                {value}
            </motion.div>

            <motion.div
                className={styles.cardSub}
                variants={{
                    rest: { opacity: 0.5 },
                    hover: { opacity: 1, transition: { duration: 0.25 } }
                }}
            >
                {sub}
            </motion.div>
        </motion.div>
    );
}

interface SplitCardProps {
    label: string;
    icon: React.ReactNode;
    left: { val: React.ReactNode; sub: string };
    right: { val: React.ReactNode; sub: string };
}

function SplitCard({ label, icon, left, right }: SplitCardProps) {
    return (
        <motion.div
            className={styles.card}
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
        >
            <motion.div
                className={styles.topLine}
                variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { scaleX: 1, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
                }}
            />

            <div className={styles.cardLabel}>
                <span className={styles.cardIcon}>{icon}</span>
                {label}
            </div>

            <div className={styles.splitRow}>
                <motion.div
                    variants={{
                        rest: { y: 0 },
                        hover: { y: -2, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
                    }}
                >
                    <div className={styles.splitVal}>{left.val}</div>
                    <div className={styles.splitSub}>{left.sub}</div>
                </motion.div>
                <div className={styles.splitDivider} />
                <motion.div
                    variants={{
                        rest: { y: 0 },
                        hover: { y: -2, transition: { duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] } }
                    }}
                >
                    <div className={styles.splitVal}>{right.val}</div>
                    <div className={styles.splitSub}>{right.sub}</div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export const IPOPerformanceStats: React.FC<IPOPerformanceStatsProps> = ({
    allStats,
    mainboardStats,
    smeStats,
}) => {
    const positiveRate = allStats.withGmp > 0
        ? Math.round((allStats.positiveGmp / allStats.withGmp) * 100)
        : 0;

    return (
        <motion.div
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <StatCard
                icon={<BarChart3 size={14} style={{ color: 'var(--primary-brand)' }} />}
                label="GMP Sentiment"
                value={
                    <span style={{ color: positiveRate >= 50 ? '#22c55e' : '#f87171' }}>
                        {positiveRate}%
                    </span>
                }
                sub={`IPOs with positive GMP`}
            />

            <StatCard
                icon={
                    allStats.avgGmpPercent >= 0
                        ? <TrendingUp size={14} style={{ color: '#22c55e' }} />
                        : <TrendingDown size={14} style={{ color: '#ef4444' }} />
                }
                label="Avg GMP"
                value={
                    <span style={{ color: allStats.avgGmpPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                        {allStats.avgGmpPercent >= 0 ? '+' : ''}{allStats.avgGmpPercent}%
                    </span>
                }
                sub={`Across ${allStats.withGmp} IPOs`}
            />

            {allStats.highestGmp && (
                <StatCard
                    icon={<Award size={14} style={{ color: '#f59e0b' }} />}
                    label="Highest GMP"
                    value={<span style={{ color: '#22c55e' }}>+{allStats.highestGmp.gmpPercent}%</span>}
                    sub={allStats.highestGmp.name}
                />
            )}

            {allStats.mostSubscribed && (
                <StatCard
                    icon={<Users size={14} style={{ color: 'var(--primary-brand)' }} />}
                    label="Most Subscribed"
                    value={
                        <span style={{ color: 'var(--primary-brand)' }}>
                            {allStats.mostSubscribed.subscriptionNum}x
                        </span>
                    }
                    sub={allStats.mostSubscribed.name}
                />
            )}

            <SplitCard
                icon={<Layers size={14} style={{ color: '#38bdf8' }} />}
                label="Mainboard vs SME"
                left={{ val: mainboardStats.total, sub: 'Mainboard' }}
                right={{ val: smeStats.total, sub: 'SME' }}
            />

            <SplitCard
                icon={<TrendingUp size={14} style={{ color: 'var(--primary-brand)' }} />}
                label="Avg Subscription"
                left={{
                    val: <span style={{ color: 'var(--primary-brand)' }}>{mainboardStats.avgSubscription}x</span>,
                    sub: 'Mainboard'
                }}
                right={{
                    val: <span style={{ color: 'var(--primary-brand)' }}>{smeStats.avgSubscription}x</span>,
                    sub: 'SME'
                }}
            />
        </motion.div>
    );
};
