import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchFiiDiiToday } from '@/lib/fiiDii';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'FII/DII Flows | Staqq Signals',
    description: 'Real-time Foreign and Domestic Institutional Investor buy/sell data for Indian stock markets.',
    openGraph: {
        title: 'FII/DII Flows | Staqq Signals',
        description: 'Real-time Foreign and Domestic Institutional Investor buy/sell data for Indian stock markets.',
        images: ['/api/og/signals?type=fii-dii&title=FII/DII+Institutional+Flows'],
    },
    twitter: {
        card: 'summary_large_image' as const,
        title: 'FII/DII Flows | Staqq Signals',
        images: ['/api/og/signals?type=fii-dii&title=FII/DII+Institutional+Flows'],
    },
};

export default async function FiiDiiPage() {
    const data = await fetchFiiDiiToday();

    const fiiDiiJsonLd = data ? {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `FII/DII Flows — ${data.date}`,
        description: `Foreign Institutional Investor net: ₹${data.fii.net.toLocaleString('en-IN')} Cr. Domestic Institutional Investor net: ₹${data.dii.net.toLocaleString('en-IN')} Cr. Combined net: ₹${data.totalNet.toLocaleString('en-IN')} Cr.`,
        temporalCoverage: data.date,
        creator: { '@type': 'Organization', name: 'Staqq', url: 'https://staqq.com' },
    } : null;

    return (
        <main className={styles.main}>
            {fiiDiiJsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(fiiDiiJsonLd) }} />
            )}
            <div className="container">
                <Link href="/signals" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Signals
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>
                        FII/DII <span className="text-brand">Flows</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Institutional money flows — track where the smart money is going.
                    </p>
                    {data && <p className={styles.lastUpdated}>Data as of: {data.date}</p>}
                </div>

                {data ? (
                    <>
                        {/* Summary Cards */}
                        <div className={styles.summaryGrid}>
                            <Card className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>FII/FPI Net</div>
                                <div className={styles.summaryValue} style={{ color: data.fii.net >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {data.fii.net >= 0 ? '+' : ''}₹{Math.abs(data.fii.net).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.summarySub}>
                                    Buy: ₹{data.fii.buy.toLocaleString('en-IN')} Cr | Sell: ₹{data.fii.sell.toLocaleString('en-IN')} Cr
                                </div>
                            </Card>

                            <Card className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>DII Net</div>
                                <div className={styles.summaryValue} style={{ color: data.dii.net >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {data.dii.net >= 0 ? '+' : ''}₹{Math.abs(data.dii.net).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.summarySub}>
                                    Buy: ₹{data.dii.buy.toLocaleString('en-IN')} Cr | Sell: ₹{data.dii.sell.toLocaleString('en-IN')} Cr
                                </div>
                            </Card>

                            <Card className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Combined Net</div>
                                <div className={styles.summaryValue} style={{ color: data.totalNet >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {data.totalNet >= 0 ? '+' : ''}₹{Math.abs(data.totalNet).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.summarySub}>
                                    FII + DII total activity
                                </div>
                            </Card>

                            <Card className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Market Sentiment</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    {data.totalNet >= 0
                                        ? <TrendingUp size={24} style={{ color: '#22c55e' }} />
                                        : <TrendingDown size={24} style={{ color: '#ef4444' }} />
                                    }
                                    <span style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: data.totalNet >= 0 ? '#22c55e' : '#ef4444'
                                    }}>
                                        {data.totalNet >= 0 ? 'Net Buying' : 'Net Selling'}
                                    </span>
                                </div>
                                <div className={styles.summarySub}>
                                    {data.fii.net >= 0 ? 'FII bullish' : 'FII bearish'} • {data.dii.net >= 0 ? 'DII bullish' : 'DII bearish'}
                                </div>
                            </Card>
                        </div>

                        {/* Detail Table */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Buy (₹ Cr)</th>
                                        <th>Sell (₹ Cr)</th>
                                        <th>Net (₹ Cr)</th>
                                        <th>Direction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>FII / FPI</td>
                                        <td className={styles.positive}>₹{data.fii.buy.toLocaleString('en-IN')}</td>
                                        <td className={styles.negative}>₹{data.fii.sell.toLocaleString('en-IN')}</td>
                                        <td className={data.fii.net >= 0 ? styles.positive : styles.negative}>
                                            {data.fii.net >= 0 ? '+' : ''}₹{data.fii.net.toLocaleString('en-IN')}
                                        </td>
                                        <td>
                                            <span className={data.fii.net >= 0 ? styles.buyBadge : styles.sellBadge}>
                                                {data.fii.net >= 0 ? 'Net Buy' : 'Net Sell'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>DII</td>
                                        <td className={styles.positive}>₹{data.dii.buy.toLocaleString('en-IN')}</td>
                                        <td className={styles.negative}>₹{data.dii.sell.toLocaleString('en-IN')}</td>
                                        <td className={data.dii.net >= 0 ? styles.positive : styles.negative}>
                                            {data.dii.net >= 0 ? '+' : ''}₹{data.dii.net.toLocaleString('en-IN')}
                                        </td>
                                        <td>
                                            <span className={data.dii.net >= 0 ? styles.buyBadge : styles.sellBadge}>
                                                {data.dii.net >= 0 ? 'Net Buy' : 'Net Sell'}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <h3>FII/DII data unavailable</h3>
                        <p>Data is typically available after market hours (6-7 PM IST). Check back later.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
