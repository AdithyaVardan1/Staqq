
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

// Mock Data for individual page
const IPO_DATA = {
    name: 'Zomato Ltd',
    priceBand: '₹72 - ₹76',
    lotSize: 195,
    issueSize: '₹9,375 Cr',
    status: 'Live',
    openDate: 'Jul 14',
    closeDate: 'Jul 16',
    subscription: {
        retail: 7.4,
        hni: 3.2,
        qib: 15.6,
        total: 38.2,
    },
    gmpTrend: [
        { date: 'Jul 10', value: 10 },
        { date: 'Jul 11', value: 12 },
        { date: 'Jul 12', value: 15 },
        { date: 'Jul 13', value: 18 },
        { date: 'Jul 14', value: 15 },
    ],
};

export default function IPODetail({ params }: { params: { slug: string } }) {
    // In a real app, await params and fetch data
    return (
        <main className={styles.main}>
            <div className="container">
                {/* Breadcrumb & Actions */}
                <div className={styles.topBar}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to IPOs
                    </Link>
                    <Button variant="ghost" size="icon"><Share2 size={20} /></Button>
                </div>

                {/* Header Section */}
                <section className={styles.header}>
                    <div className={styles.logoName}>
                        <div className={styles.logoCtx}>Z</div>
                        <div>
                            <h1 className={styles.title}>{IPO_DATA.name}</h1>
                            <div className={styles.badges}>
                                <Badge variant="brand">Mainboard</Badge>
                                <Badge variant="success">Live Now</Badge>
                            </div>
                        </div>
                    </div>
                    <div className={styles.ctaSection}>
                        <div className={styles.priceBlock}>
                            <span className={styles.label}>Price Band</span>
                            <span className={styles.heroPrice}>{IPO_DATA.priceBand}</span>
                        </div>
                        <Button variant="primary" size="lg">Apply Now</Button>
                    </div>
                </section>

                {/* Layout Grid */}
                <div className={styles.grid}>
                    {/* Left Column (Main Info) */}
                    <div className={styles.colMain}>
                        {/* Subscription Status */}
                        <Card className={styles.sectionCard}>
                            <h2 className={styles.cardTitle}>Subscription Status</h2>
                            <div className={styles.subGrid}>
                                <div className={styles.subItem}>
                                    <div className={styles.subLabel}> Retail (RII)</div>
                                    <div className={styles.subVal}>{IPO_DATA.subscription.retail}x</div>
                                    <ProgressBar progress={70} variant="brand" />
                                </div>
                                <div className={styles.subItem}>
                                    <div className={styles.subLabel}> Non-Inst (NII)</div>
                                    <div className={styles.subVal}>{IPO_DATA.subscription.hni}x</div>
                                    <ProgressBar progress={30} variant="warning" />
                                </div>
                                <div className={styles.subItem}>
                                    <div className={styles.subLabel}> QIB</div>
                                    <div className={styles.subVal}>{IPO_DATA.subscription.qib}x</div>
                                    <ProgressBar progress={90} variant="success" />
                                </div>
                            </div>
                            <div className={styles.totalSub}>
                                <span>Total Subscription</span>
                                <span className="text-brand">{IPO_DATA.subscription.total}x</span>
                            </div>
                        </Card>

                        {/* GMP Trend */}
                        <Card className={styles.sectionCard}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>GMP Trend</h2>
                                <Badge variant="neutral">Updated 1h ago</Badge>
                            </div>
                            <div className={styles.chartWrapper}>
                                <FinancialChart data={IPO_DATA.gmpTrend} />
                            </div>
                            <p className={styles.disclaimer}>
                                * Grey Market Premium is unofficial and non-binding.
                            </p>
                        </Card>
                    </div>

                    {/* Right Column (Stats) */}
                    <aside className={styles.colSide}>
                        <Card className={styles.statsCard} variant="glass">
                            <h3 className={styles.sidebarTitle}>Issue Details</h3>
                            <div className={styles.statRow}>
                                <span>Issue Size</span>
                                <span className={styles.statVal}>{IPO_DATA.issueSize}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span>Lot Size</span>
                                <span className={styles.statVal}>{IPO_DATA.lotSize} Shares</span>
                            </div>
                            <div className={styles.statRow}>
                                <span>Min Investment</span>
                                <span className={styles.statVal}>₹14,820</span>
                            </div>
                            <div className={styles.statRow}>
                                <span>Dates</span>
                                <span className={styles.statVal}>{IPO_DATA.openDate} - {IPO_DATA.closeDate}</span>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </main>
    );
}
