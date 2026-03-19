import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { fetchInsiderTrades } from '@/lib/insiderTrades';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'Insider Trades | Staqq Signals',
    description: 'Track promoter and insider trading disclosures from NSE — see what company insiders are buying and selling.',
    openGraph: {
        title: 'Insider Trades | Staqq Signals',
        description: 'Track promoter and insider trading disclosures from NSE — see what company insiders are buying and selling.',
        images: ['/api/og/signals?type=insider-trades&title=Insider+Trading+Disclosures'],
    },
    twitter: {
        card: 'summary_large_image' as const,
        title: 'Insider Trades | Staqq Signals',
        images: ['/api/og/signals?type=insider-trades&title=Insider+Trading+Disclosures'],
    },
};

export default async function InsiderTradesPage() {
    const trades = await fetchInsiderTrades(14);

    const buyTrades = trades.filter(t => t.acquireMode?.toLowerCase().includes('purchase') || t.acquireMode?.toLowerCase().includes('buy'));
    const sellTrades = trades.filter(t => t.acquireMode?.toLowerCase().includes('sale') || t.acquireMode?.toLowerCase().includes('sell'));

    return (
        <main className={styles.main}>
            <div className="container">
                <Link href="/signals" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Signals
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Insider <span className="text-brand">Trades</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Promoter and insider trading disclosures from the last 14 days.
                    </p>
                </div>

                {trades.length > 0 ? (
                    <>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Total Disclosures</div>
                                <div className={styles.summaryValue}>{trades.length}</div>
                            </div>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Buy Trades</div>
                                <div className={styles.summaryValue} style={{ color: '#22c55e' }}>{buyTrades.length}</div>
                            </div>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Sell Trades</div>
                                <div className={styles.summaryValue} style={{ color: '#ef4444' }}>{sellTrades.length}</div>
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Symbol</th>
                                        <th>Person</th>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th>Shares</th>
                                        <th>% Before</th>
                                        <th>% After</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map((trade, i) => {
                                        const isBuy = trade.acquireMode?.toLowerCase().includes('purchase') || trade.acquireMode?.toLowerCase().includes('buy');
                                        return (
                                            <tr key={i}>
                                                <td>{trade.transactionDate}</td>
                                                <td>
                                                    <Link href={`/stocks/${trade.symbol}`} className={styles.symbolLink}>
                                                        {trade.symbol}
                                                    </Link>
                                                </td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {trade.personName}
                                                </td>
                                                <td>
                                                    <span className={styles.badge} style={{ color: '#888', background: 'rgba(255,255,255,0.05)' }}>
                                                        {trade.personCategory}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={isBuy ? styles.buyBadge : styles.sellBadge}>
                                                        {trade.acquireMode}
                                                    </span>
                                                </td>
                                                <td>{trade.sharesAcquired.toLocaleString('en-IN')}</td>
                                                <td>{trade.beforePercent}%</td>
                                                <td>{trade.afterPercent}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <Users size={40} style={{ color: '#444', marginBottom: '16px' }} />
                        <h3>No insider trades found</h3>
                        <p>Insider trading disclosures will appear here once data is available from NSE.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
