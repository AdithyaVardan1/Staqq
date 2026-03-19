import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { fetchTodayDeals } from '@/lib/bulkDeals';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'Bulk & Block Deals | Staqq Signals',
    description: 'Track large institutional deals — bulk and block transactions from NSE.',
    openGraph: {
        title: 'Bulk & Block Deals | Staqq Signals',
        description: 'Track large institutional deals — bulk and block transactions from NSE.',
        images: ['/api/og/signals?type=bulk-deals&title=Bulk+%26+Block+Deals'],
    },
    twitter: {
        card: 'summary_large_image' as const,
        title: 'Bulk & Block Deals | Staqq Signals',
        images: ['/api/og/signals?type=bulk-deals&title=Bulk+%26+Block+Deals'],
    },
};

export default async function BulkDealsPage() {
    const deals = await fetchTodayDeals();

    const totalValue = deals.reduce((sum, d) => sum + d.valueCr, 0);
    const bulkCount = deals.filter(d => d.type === 'BULK').length;
    const blockCount = deals.filter(d => d.type === 'BLOCK').length;
    const buyDeals = deals.filter(d => d.buySell === 'BUY');
    const sellDeals = deals.filter(d => d.buySell === 'SELL');

    return (
        <main className={styles.main}>
            <div className="container">
                <Link href="/signals" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Signals
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Bulk & Block <span className="text-brand">Deals</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Large institutional transactions — track smart money moves.
                    </p>
                </div>

                {deals.length > 0 ? (
                    <>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Total Deals</div>
                                <div className={styles.summaryValue}>{deals.length}</div>
                                <div className={styles.summarySub}>{bulkCount} bulk • {blockCount} block</div>
                            </div>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Total Value</div>
                                <div className={styles.summaryValue} style={{ color: 'var(--primary-brand)' }}>
                                    ₹{Math.round(totalValue).toLocaleString('en-IN')} Cr
                                </div>
                            </div>
                            <div className={styles.summaryCard} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                                <div className={styles.summaryLabel}>Buy vs Sell</div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <span style={{ color: '#22c55e', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>{buyDeals.length} buys</span>
                                    <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>{sellDeals.length} sells</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Symbol</th>
                                        <th>Client</th>
                                        <th>Direction</th>
                                        <th>Qty</th>
                                        <th>Price (₹)</th>
                                        <th>Value (₹ Cr)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deals.map((deal, i) => (
                                        <tr key={i}>
                                            <td>
                                                <span className={styles.badge} style={{
                                                    color: deal.type === 'BLOCK' ? '#f59e0b' : '#8b5cf6',
                                                    background: deal.type === 'BLOCK' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
                                                }}>
                                                    {deal.type}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/stocks/${deal.symbol}`} className={styles.symbolLink}>
                                                    {deal.symbol}
                                                </Link>
                                            </td>
                                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {deal.clientName}
                                            </td>
                                            <td>
                                                <span className={deal.buySell === 'BUY' ? styles.buyBadge : styles.sellBadge}>
                                                    {deal.buySell}
                                                </span>
                                            </td>
                                            <td>{deal.quantity.toLocaleString('en-IN')}</td>
                                            <td>₹{deal.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td style={{ fontWeight: 600, fontFamily: 'var(--font-outfit)' }}>
                                                ₹{deal.valueCr.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <Building2 size={40} style={{ color: '#444', marginBottom: '16px' }} />
                        <h3>No deals today</h3>
                        <p>Bulk and block deal data appears during/after market hours.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
