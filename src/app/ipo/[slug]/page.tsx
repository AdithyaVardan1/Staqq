import React from 'react';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Share2, TrendingUp, TrendingDown, Flame, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getIPOBySlug, getAllIPOs } from '@/lib/ipo';
import styles from './page.module.css';
import IPOTracker from '@/components/ipo/IPOTracker';

export const revalidate = 300;

// Generate static params for known slugs
export async function generateStaticParams() {
    const ipos = await getAllIPOs();
    return ipos.map(ipo => ({ slug: ipo.slug }));
}

export default async function IPODetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const ipo = await getIPOBySlug(slug);

    if (!ipo) {
        notFound();
    }

    const gmpPositive = (ipo.gmpPercent ?? 0) > 0;
    const gmpNegative = (ipo.gmpPercent ?? 0) < 0;

    const statusVariant = ipo.status === 'Live' ? 'brand'
        : ipo.status === 'Upcoming' ? 'neutral'
            : 'success';

    return (
        <main className={styles.main}>
            <div className="container">
                {/* Breadcrumb & Actions */}
                <div className={styles.topBar}>
                    <Link href="/ipo" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to IPOs
                    </Link>
                </div>

                {/* Header Section */}
                <IPOTracker slug={slug} />
                <section className={styles.header}>
                    <div className={styles.logoName}>
                        <div className={styles.logoCtx}>{ipo.name.charAt(0)}</div>
                        <div>
                            <h1 className={styles.title}>{ipo.name}</h1>
                            <div className={styles.badges}>
                                <Badge variant={statusVariant}>
                                    {ipo.status === 'Live' && <span className={styles.liveDot} />}
                                    {ipo.status}
                                </Badge>
                                <Badge variant="outline">{ipo.category}</Badge>
                                {ipo.hasAnchor && (
                                    <Badge variant="success">
                                        <CheckCircle size={12} style={{ marginRight: 4 }} />
                                        Anchor
                                    </Badge>
                                )}
                                {ipo.rating > 0 && (
                                    <div className={styles.ratingBadge}>
                                        {Array.from({ length: ipo.rating }).map((_, i) => (
                                            <Flame key={i} size={14} className={styles.fireIcon} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {ipo.price && (
                        <div className={styles.ctaSection}>
                            <div className={styles.priceBlock}>
                                <span className={styles.label}>Issue Price</span>
                                <span className={styles.heroPrice}>₹{ipo.price}</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Layout Grid */}
                <div className={styles.grid}>
                    {/* Left Column */}
                    <div className={styles.colMain}>
                        {/* GMP Card */}
                        <Card className={styles.sectionCard}>
                            <h2 className={styles.cardTitle}>Grey Market Premium (GMP)</h2>
                            <div className={styles.gmpHero}>
                                <div className={styles.gmpMain}>
                                    {gmpPositive ? <TrendingUp size={28} className={styles.gmpIconGreen} /> :
                                        gmpNegative ? <TrendingDown size={28} className={styles.gmpIconRed} /> : null}
                                    <span className={gmpPositive ? styles.gmpValueGreen : gmpNegative ? styles.gmpValueRed : styles.gmpValueNeutral}>
                                        {ipo.gmp !== null ? `${ipo.gmp >= 0 ? '+' : ''}₹${ipo.gmp}` : '—'}
                                    </span>
                                    {ipo.gmpPercent !== null && (
                                        <span className={styles.gmpPct}>
                                            ({ipo.gmpPercent >= 0 ? '+' : ''}{ipo.gmpPercent}%)
                                        </span>
                                    )}
                                </div>
                                {ipo.estListing && (
                                    <div className={styles.estListing}>
                                        <span className={styles.label}>Est. Listing Price</span>
                                        <span className={styles.estListingVal}>₹{ipo.estListing}</span>
                                    </div>
                                )}
                            </div>
                            <p className={styles.disclaimer}>
                                * Grey Market Premium is unofficial and non-binding.
                            </p>
                        </Card>

                        {/* Subscription Card */}
                        {ipo.subscription && (
                            <Card className={styles.sectionCard}>
                                <h2 className={styles.cardTitle}>Subscription Status</h2>
                                <div className={styles.subHero}>
                                    <span className={styles.subHeroVal}>{ipo.subscription}</span>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column (Stats) */}
                    <aside className={styles.colSide}>
                        <Card className={styles.statsCard} variant="glass">
                            <h3 className={styles.sidebarTitle}>Issue Details</h3>

                            {ipo.ipoSizeCr && (
                                <div className={styles.statRow}>
                                    <span>Issue Size</span>
                                    <span className={styles.statVal}>₹{ipo.ipoSizeCr} Cr</span>
                                </div>
                            )}

                            {ipo.lotSize && (
                                <div className={styles.statRow}>
                                    <span>Lot Size</span>
                                    <span className={styles.statVal}>{ipo.lotSize} Shares</span>
                                </div>
                            )}

                            {ipo.price && ipo.lotSize && (
                                <div className={styles.statRow}>
                                    <span>Min Investment</span>
                                    <span className={styles.statVal}>₹{(ipo.price * ipo.lotSize).toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            {ipo.peRatio && (
                                <div className={styles.statRow}>
                                    <span>P/E Ratio</span>
                                    <span className={styles.statVal}>{ipo.peRatio}</span>
                                </div>
                            )}

                            <div className={styles.statRow}>
                                <span>Open Date</span>
                                <span className={styles.statVal}>{ipo.openDate || 'TBA'}</span>
                            </div>
                            <div className={styles.statRow}>
                                <span>Close Date</span>
                                <span className={styles.statVal}>{ipo.closeDate || 'TBA'}</span>
                            </div>

                            {ipo.boaDate && (
                                <div className={styles.statRow}>
                                    <span>Allotment</span>
                                    <span className={styles.statVal}>{ipo.boaDate}</span>
                                </div>
                            )}

                            {ipo.listingDate && (
                                <div className={styles.statRow}>
                                    <span>Listing Date</span>
                                    <span className={styles.statVal}>{ipo.listingDate}</span>
                                </div>
                            )}

                            {ipo.updatedOn && (
                                <div className={styles.statRow + ' ' + styles.updatedRow}>
                                    <span>Last Updated</span>
                                    <span className={styles.statVal}>{ipo.updatedOn}</span>
                                </div>
                            )}
                        </Card>
                    </aside>
                </div>
            </div>
        </main>
    );
}
