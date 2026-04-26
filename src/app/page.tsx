import Link from 'next/link';
import { getAllIPOs } from '@/lib/ipo';
import { getCategoryStats } from '@/lib/ipoAnalytics';
import { getGmpSentiment } from '@/lib/ipoAnalytics';
import { fetchFiiDiiToday } from '@/lib/fiiDii';
import { getAllPosts } from '@/lib/social';
import { Layers, BarChart3, TrendingUp, Activity, Zap, ArrowRight, Users, Building2, Crown, Bell, LineChart, Mail } from 'lucide-react';
import { EmailCapture } from '@/components/marketing/EmailCapture';
import styles from './page.module.css';

export const revalidate = 300;

function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export default async function HomePage() {
    const [allIPOs, fiiDii, posts] = await Promise.all([
        getAllIPOs(),
        fetchFiiDiiToday().catch(() => null),
        getAllPosts(20).catch(() => []),
    ]);

    const liveIPOs = allIPOs.filter(i => i.status === 'Live');
    const upcomingIPOs = allIPOs.filter(i => i.status === 'Upcoming');
    const stats = getCategoryStats(allIPOs);

    // Top GMP IPOs for showcase
    const topGmp = allIPOs
        .filter(i => i.gmpPercent !== null && i.gmpPercent > 0)
        .sort((a, b) => (b.gmpPercent ?? 0) - (a.gmpPercent ?? 0))
        .slice(0, 5);

    // Trending tickers from social posts
    const tickerCounts: Record<string, number> = {};
    posts.forEach(p => {
        p.tickers?.forEach((t: string) => {
            tickerCounts[t] = (tickerCounts[t] || 0) + 1;
        });
    });
    const trending = Object.entries(tickerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([ticker]) => ticker);

    // JSON-LD structured data
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Staqq',
        url: 'https://staqq.in',
        description: 'Every edge, one dashboard. IPO GMP tracking, FII/DII flows, social sentiment, insider trades, and smart screeners for Indian investors.',
        publisher: {
            '@type': 'Organization',
            name: 'Staqq',
            url: 'https://staqq.in',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://staqq.in/stocks/{search_term}',
            'query-input': 'required name=search_term',
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'What is IPO GMP (Grey Market Premium)?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'IPO GMP is the premium at which IPO shares trade in the unofficial grey market before listing. A positive GMP indicates market expects the IPO to list above issue price. Staqq tracks live GMP for all Indian IPOs with sentiment scoring.',
                },
            },
            {
                '@type': 'Question',
                name: 'How to check FII DII data today?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Staqq provides real-time FII (Foreign Institutional Investor) and DII (Domestic Institutional Investor) buy/sell data from NSE. Check the Signals page for daily institutional flow data updated after market hours.',
                },
            },
            {
                '@type': 'Question',
                name: 'How to calculate IPO allotment probability?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'IPO allotment probability depends on the subscription multiple. If an IPO is subscribed 10x in retail category, each application has roughly a 10% chance of allotment. Use Staqq\'s Allotment Calculator for exact estimates with multi-application strategies.',
                },
            },
        ],
    };

    return (
        <main className={styles.main}>
            <JsonLd data={websiteSchema} />
            <JsonLd data={faqSchema} />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroGlowLime} aria-hidden="true" />
                <div className={styles.heroGlowViolet} aria-hidden="true" />
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Every <span className="text-brand">Edge.</span> One Dashboard.
                        </h1>
                        <p className={styles.heroSubtitle}>
                            From IPO GMP and allotment odds to FII/DII flows, social sentiment, and insider trades. Staqq gives Indian investors the full picture before the market opens.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/ipo" className={styles.primaryBtn}>
                                Explore the Dashboard
                            </Link>
                            <Link href="/signals" className={styles.outlineBtn}>
                                View Market Signals
                            </Link>
                        </div>

                        {/* Trending tickers - server rendered */}
                        {trending.length > 0 && (
                            <div className={styles.trendingContainer}>
                                <span className={styles.trendingLabel}>
                                    <Activity size={14} /> Trending Today:
                                </span>
                                <div className={styles.trendingList}>
                                    {trending.map(ticker => (
                                        <Link key={ticker} href={`/stocks/${ticker}`} className={styles.trendingItem}>
                                            {ticker}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Live Market Pulse - real data */}
            <section className={styles.pulseSection}>
                <div className="container">
                    <div className={styles.pulseGrid}>
                        {/* IPO Activity */}
                        <div className={styles.pulseCard}>
                            <div className={styles.pulseHeader}>
                                <Zap size={16} className={styles.pulseIcon} />
                                <span>IPO Activity</span>
                            </div>
                            <div className={styles.pulseStats}>
                                <div className={styles.pulseStat}>
                                    <span className={styles.pulseNum}>{liveIPOs.length}</span>
                                    <span className={styles.pulseLabel}>Live</span>
                                </div>
                                <div className={styles.pulseStat}>
                                    <span className={styles.pulseNum}>{upcomingIPOs.length}</span>
                                    <span className={styles.pulseLabel}>Upcoming</span>
                                </div>
                                <div className={styles.pulseStat}>
                                    <span className={styles.pulseNum}>{stats.total}</span>
                                    <span className={styles.pulseLabel}>Tracked</span>
                                </div>
                            </div>
                            <Link href="/ipo" className={styles.pulseLink}>
                                View all IPOs <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* FII/DII Quick */}
                        <div className={styles.pulseCard}>
                            <div className={styles.pulseHeader}>
                                <BarChart3 size={16} className={styles.pulseIcon} />
                                <span>FII/DII Flows</span>
                            </div>
                            {fiiDii ? (
                                <>
                                    <div className={styles.pulseStats}>
                                        <div className={styles.pulseStat}>
                                            <span className={styles.pulseNum} style={{ color: fiiDii.fii.net >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.2rem' }}>
                                                {fiiDii.fii.net >= 0 ? '+' : ''}₹{Math.abs(fiiDii.fii.net).toLocaleString('en-IN')} Cr
                                            </span>
                                            <span className={styles.pulseLabel}>FII Net</span>
                                        </div>
                                        <div className={styles.pulseStat}>
                                            <span className={styles.pulseNum} style={{ color: fiiDii.dii.net >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.2rem' }}>
                                                {fiiDii.dii.net >= 0 ? '+' : ''}₹{Math.abs(fiiDii.dii.net).toLocaleString('en-IN')} Cr
                                            </span>
                                            <span className={styles.pulseLabel}>DII Net</span>
                                        </div>
                                    </div>
                                    <Link href="/signals/fii-dii" className={styles.pulseLink}>
                                        Full breakdown <ArrowRight size={14} />
                                    </Link>
                                </>
                            ) : (
                                <p className={styles.pulseEmpty}>Available after market hours</p>
                            )}
                        </div>

                        {/* Social Sentiment */}
                        <div className={styles.pulseCard}>
                            <div className={styles.pulseHeader}>
                                <Activity size={16} className={styles.pulseIcon} />
                                <span>Social Sentiment</span>
                            </div>
                            <div className={styles.pulseStats}>
                                <div className={styles.pulseStat}>
                                    <span className={styles.pulseNum}>{posts.length}</span>
                                    <span className={styles.pulseLabel}>Posts Today</span>
                                </div>
                                <div className={styles.pulseStat}>
                                    <span className={styles.pulseNum}>{posts.filter(p => p.isHot).length}</span>
                                    <span className={styles.pulseLabel}>Hot</span>
                                </div>
                            </div>
                            <Link href="/signals" className={styles.pulseLink}>
                                View signals <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top GMP IPOs - real data for SEO */}
            {topGmp.length > 0 && (
                <section className={styles.topSection}>
                    <div className="container">
                        <div className={styles.sectionHead}>
                            <h2>Top GMP IPOs Right Now</h2>
                            <Link href="/ipo" className={styles.seeAll}>See all <ArrowRight size={14} /></Link>
                        </div>
                        <div className={styles.ipoGrid}>
                            {topGmp.map(ipo => {
                                const sentiment = getGmpSentiment(ipo.gmpPercent);
                                return (
                                    <Link key={ipo.slug} href={`/ipo/${ipo.slug}`} className={styles.ipoCard}>
                                        <div className={styles.ipoCardTop}>
                                            <span className={styles.ipoName}>{ipo.name}</span>
                                            <span className={styles.ipoBadge} style={{ color: sentiment.color, background: `${sentiment.color}18` }}>
                                                {ipo.status}
                                            </span>
                                        </div>
                                        <div className={styles.ipoGmp} style={{ color: sentiment.color }}>
                                            +{ipo.gmpPercent}%
                                        </div>
                                        <div className={styles.ipoMeta}>
                                            {ipo.price && <span>₹{ipo.price}</span>}
                                            {ipo.subscription && <span>{ipo.subscription} subscribed</span>}
                                            <span>{ipo.category}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Feature Cards */}
            <section className={styles.features}>
                <div className="container">
                    <h2 className={styles.featuresTitle}>Everything Indian Investors Need</h2>
                    <div className={styles.grid}>
                        <Link href="/ipo" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <Layers size={32} />
                                </div>
                                <h3>IPO Intelligence</h3>
                                <p>Live GMP with sentiment scoring, performance analytics, and allotment probability calculator for every IPO and SME listing in India.</p>
                            </div>
                        </Link>
                        <Link href="/signals" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <BarChart3 size={32} />
                                </div>
                                <h3>Market Signals</h3>
                                <p>Social media sentiment from Reddit and Twitter, FII/DII institutional flows, insider trading disclosures, and bulk deal tracking.</p>
                            </div>
                        </Link>
                        <Link href="/signals/fii-dii" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <Users size={32} />
                                </div>
                                <h3>FII/DII Flows</h3>
                                <p>Daily Foreign and Domestic Institutional Investor buy/sell data. Track where the smart money is flowing in Indian markets.</p>
                            </div>
                        </Link>
                        <Link href="/signals/insider-trades" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <Building2 size={32} />
                                </div>
                                <h3>Insider Trades</h3>
                                <p>Promoter and insider trading disclosures from NSE. See what company insiders are buying and selling before the market reacts.</p>
                            </div>
                        </Link>
                        <Link href="/stocks/screener" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <TrendingUp size={32} />
                                </div>
                                <h3>Stock Screener</h3>
                                <p>Filter NSE and BSE stocks by market cap, P/E ratio, sector, and more. Find undervalued opportunities with fundamental analysis.</p>
                            </div>
                        </Link>
                        <Link href="/ipo/allotment-calculator" className={styles.cardLink}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <Activity size={32} />
                                </div>
                                <h3>Allotment Calculator</h3>
                                <p>Calculate your IPO allotment probability based on subscription multiples. Optimize multi-application strategies to maximize chances.</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pro CTA Section */}
            <section className={styles.proSection}>
                <div className="container">
                    <div className={styles.proContent}>
                        <div className={styles.proBadge}>
                            <Crown size={14} /> Staqq Pro
                        </div>
                        <h2 className={styles.proTitle}>
                            Get the edge serious investors need
                        </h2>
                        <p className={styles.proSubtitle}>
                            Unlock real-time signals, composite IPO scores, custom alert rules, and daily morning briefs. Starting at just ₹499/mo.
                        </p>
                        <div className={styles.proFeatures}>
                            <div className={styles.proFeature}>
                                <LineChart size={20} />
                                <div>
                                    <strong>Composite IPO Score</strong>
                                    <span>One number (1-10) combining GMP, subscription, quality, and size</span>
                                </div>
                            </div>
                            <div className={styles.proFeature}>
                                <Bell size={20} />
                                <div>
                                    <strong>Custom Alert Rules</strong>
                                    <span>Set conditions like &quot;FII sells &gt; ₹5,000 Cr&quot; and get notified instantly</span>
                                </div>
                            </div>
                            <div className={styles.proFeature}>
                                <Mail size={20} />
                                <div>
                                    <strong>Morning Market Brief</strong>
                                    <span>Daily email with overnight GMP changes, top signals, and FII/DII summary</span>
                                </div>
                            </div>
                            <div className={styles.proFeature}>
                                <Zap size={20} />
                                <div>
                                    <strong>Real-Time Signals</strong>
                                    <span>Zero delay on social spikes, insider trades, and bulk deals</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.proActions}>
                            <Link href="/pricing" className={styles.primaryBtn}>
                                View Pricing
                            </Link>
                            <span className={styles.proNote}>Cancel anytime. UPI, cards, netbanking accepted.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Email Capture */}
            <section className={styles.emailSection}>
                <div className="container">
                    <EmailCapture />
                </div>
            </section>

            {/* SEO content section */}
            <section className={styles.seoSection}>
                <div className="container">
                    <h2>Why Staqq?</h2>
                    <div className={styles.seoGrid}>
                        <div>
                            <h3>Real-Time IPO GMP Tracking</h3>
                            <p>
                                Staqq tracks Grey Market Premium for every upcoming, live, and recently listed IPO in India.
                                Unlike other platforms, we provide GMP sentiment scoring that translates raw numbers into
                                actionable signals like &quot;Very Bullish&quot; or &quot;Bearish&quot; so you know exactly where market
                                sentiment stands.
                            </p>
                        </div>
                        <div>
                            <h3>Alternative Data Signals</h3>
                            <p>
                                Go beyond price charts. Staqq aggregates social media discussions from r/IndianStockMarket,
                                r/IndianStreetBets, and FinTwit, detects mention spikes, and overlays institutional data
                                like FII/DII flows and insider trades, giving you signals that most retail investors miss.
                            </p>
                        </div>
                        <div>
                            <h3>Built for Indian Markets</h3>
                            <p>
                                Every feature is built specifically for NSE and BSE. From IPO subscription data to
                                SEBI insider disclosures, from bulk deal tracking to SME IPO analysis. This is the
                                intelligence platform Indian investors have been waiting for.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
