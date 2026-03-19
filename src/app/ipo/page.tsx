import React from 'react';
import Link from 'next/link';
import { getAllIPOs } from '@/lib/ipo';
import type { IPOData } from '@/lib/ipo';
import { getCategoryStats } from '@/lib/ipoAnalytics';
import { IPOCard } from '@/components/ipo/IPOCard';
import { IPOPerformanceStats } from '@/components/ipo/IPOPerformanceStats';
import { BarChart3, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 300;

export const metadata = {
    title: 'IPO Hub | Staqq — Live GMP & IPO Intelligence',
    description: 'India\'s smartest IPO tracker. Live GMP, subscription data, performance analytics, and allotment probability for every IPO.',
    openGraph: {
        title: 'IPO Hub | Live GMP & Intelligence',
        description: 'India\'s smartest IPO tracker. Live GMP, subscription data, performance analytics, and allotment probability.',
        images: ['/api/og?title=IPO+Intelligence+Hub&subtitle=Live+GMP,+subscription+data,+performance+analytics+%26+allotment+probability'],
    },
    twitter: {
        card: 'summary_large_image' as const,
        title: 'IPO Hub | Live GMP & Intelligence | Staqq',
        images: ['/api/og?title=IPO+Intelligence+Hub&subtitle=Live+GMP,+subscription+data,+performance+analytics+%26+allotment+probability'],
    },
};

export default async function IPODashboard() {
    const allIPOs = await getAllIPOs();

    const liveIPOs = allIPOs.filter(i => i.status === 'Live');
    const upcomingIPOs = allIPOs.filter(i => i.status === 'Upcoming');
    const listedIPOs = allIPOs.filter(i => i.status === 'Listed' || i.status === 'Closed');

    const mainboardIPOs = allIPOs.filter(i => i.category === 'IPO');
    const smeIPOs = allIPOs.filter(i => i.category === 'SME');

    // Analytics
    const allStats = getCategoryStats(allIPOs);
    const mainboardStats = getCategoryStats(allIPOs, 'IPO');
    const smeStats = getCategoryStats(allIPOs, 'SME');

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroHeader}>
                        <h1 className={styles.title}>
                            IPO <span className="text-brand">Intelligence</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Live GMP with sentiment scoring, performance analytics, and allotment probability — updated every 5 minutes.
                        </p>
                        <div className={styles.stats}>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{liveIPOs.length}</span>
                                <span className={styles.statLabel}>Live</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{upcomingIPOs.length}</span>
                                <span className={styles.statLabel}>Upcoming</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{listedIPOs.length}</span>
                                <span className={styles.statLabel}>Listed</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{mainboardIPOs.length}</span>
                                <span className={styles.statLabel}>Mainboard</span>
                            </div>
                            <div className={styles.statPill}>
                                <span className={styles.statNum}>{smeIPOs.length}</span>
                                <span className={styles.statLabel}>SME</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.quickLinks}>
                            <Link href="/ipo/analytics" className={styles.quickLink}>
                                <BarChart3 size={14} />
                                IPO Analytics
                                <ArrowRight size={14} />
                            </Link>
                            <Link href="/ipo/allotment-calculator" className={styles.quickLink}>
                                <BarChart3 size={14} />
                                Allotment Calculator
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Performance Intelligence Banner */}
                    <div className={styles.sectionHeader}>
                        <h2>Market Intelligence</h2>
                        <Link href="/ipo/analytics" className={styles.viewAll}>
                            Full Analytics <ArrowRight size={14} />
                        </Link>
                    </div>
                    <IPOPerformanceStats
                        allStats={allStats}
                        mainboardStats={mainboardStats}
                        smeStats={smeStats}
                    />

                    {/* Live IPOs */}
                    {liveIPOs.length > 0 && (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>Live IPOs</h2>
                                <span className={styles.count}>{liveIPOs.length} active</span>
                            </div>
                            <div className={styles.grid}>
                                {liveIPOs.map((ipo) => (
                                    <IPOCard key={ipo.id} ipo={ipo} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Upcoming IPOs */}
                    {upcomingIPOs.length > 0 && (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>Upcoming IPOs</h2>
                                <span className={styles.count}>{upcomingIPOs.length} scheduled</span>
                            </div>
                            <div className={styles.grid}>
                                {upcomingIPOs.map((ipo) => (
                                    <IPOCard key={ipo.id} ipo={ipo} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Listed IPOs */}
                    {listedIPOs.length > 0 && (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>Recently Listed</h2>
                                <span className={styles.count}>{listedIPOs.length} completed</span>
                            </div>
                            <div className={styles.grid}>
                                {listedIPOs.map((ipo) => (
                                    <IPOCard key={ipo.id} ipo={ipo} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
