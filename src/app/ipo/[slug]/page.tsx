import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, TrendingUp, TrendingDown, Flame, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getIPOBySlug, getAllIPOs } from '@/lib/ipo';
import { estimateAllotmentProbability, getGmpSentiment } from '@/lib/ipoAnalytics';
import { GmpSentimentBadge } from '@/components/ipo/GmpSentimentBadge';
import styles from './page.module.css';

export const revalidate = 300;

// Generate static params for known slugs
export async function generateStaticParams() {
    const ipos = await getAllIPOs();
    return ipos.map(ipo => ({ slug: ipo.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const ipo = await getIPOBySlug(slug);
    if (!ipo) return { title: 'IPO Not Found | Staqq' };

    const sentiment = getGmpSentiment(ipo.gmpPercent);
    const gmpText = ipo.gmpPercent !== null ? `GMP ${ipo.gmpPercent >= 0 ? '+' : ''}${ipo.gmpPercent}%` : '';
    const title = `${ipo.name} IPO ${gmpText} | Staqq`;
    const description = `${ipo.name} ${ipo.category} — ${gmpText}${ipo.subscription ? `, ${ipo.subscription} subscribed` : ''}${ipo.price ? `, ₹${ipo.price} issue price` : ''}. Live GMP tracking & analysis.`;

    const ogParams = new URLSearchParams({
        name: ipo.name,
        ...(ipo.price && { price: String(ipo.price) }),
        ...(ipo.gmp !== null && { gmp: String(ipo.gmp) }),
        ...(ipo.gmpPercent !== null && { gmpPct: String(ipo.gmpPercent) }),
        ...(ipo.subscription && { sub: ipo.subscription }),
        status: ipo.status,
        category: ipo.category,
        sentiment: sentiment.sentiment,
    });

    return {
        title,
        description,
        openGraph: { title, description, type: 'website', images: [`/api/og/ipo?${ogParams.toString()}`] },
        twitter: { card: 'summary_large_image', title, description, images: [`/api/og/ipo?${ogParams.toString()}`] },
    };
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

    // JSON-LD for IPO
    const ipoJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: `${ipo.name} IPO`,
        description: `${ipo.name} ${ipo.category} IPO${ipo.price ? ` with issue price ₹${ipo.price}` : ''}${ipo.gmpPercent !== null ? `. Current GMP: ${ipo.gmpPercent}%` : ''}.`,
        provider: {
            '@type': 'Organization',
            name: ipo.name,
        },
        ...(ipo.price && { offers: { '@type': 'Offer', price: ipo.price, priceCurrency: 'INR' } }),
    };

    return (
        <main className={styles.main}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ipoJsonLd) }}
            />
            <div className="container">
                {/* Breadcrumb & Actions */}
                <div className={styles.topBar}>
                    <Link href="/ipo" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to IPOs
                    </Link>
                </div>

                {/* Header Section */}
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
                                <GmpSentimentBadge gmpPercent={ipo.gmpPercent} size="md" />
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
                        {/* Allotment Probability */}
                        {ipo.subscriptionNum !== null && ipo.subscriptionNum > 0 && (() => {
                            const allotment = estimateAllotmentProbability(ipo.subscriptionNum, ipo.category);
                            return (
                                <Card className={styles.statsCard} variant="glass">
                                    <h3 className={styles.sidebarTitle}>Allotment Probability</h3>
                                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                        <div style={{
                                            fontSize: '2.2rem',
                                            fontWeight: 800,
                                            fontFamily: 'var(--font-outfit)',
                                            color: allotment.color,
                                            lineHeight: 1,
                                            marginBottom: '8px'
                                        }}>
                                            {allotment.probability}%
                                        </div>
                                        <div style={{
                                            fontSize: '0.82rem',
                                            fontWeight: 700,
                                            color: allotment.color,
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            border: `1px solid ${allotment.color}40`,
                                            borderRadius: '20px',
                                        }}>
                                            {allotment.label}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '12px', textAlign: 'center' }}>
                                        Based on {ipo.subscriptionNum}x retail subscription
                                    </div>
                                </Card>
                            );
                        })()}
                    </aside>
                </div>
            </div>
        </main>
    );
}
