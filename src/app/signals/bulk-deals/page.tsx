import React from 'react';
import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';
import { fetchTodayDeals } from '@/lib/bulkDeals';
import { SignalNav } from '@/components/signals/SignalNav';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'Bulk & Block Deals | Staqq Signals',
    description: 'Track large institutional bulk and block deals from NSE. See what big money is buying and selling today.',
};

function inrCr(n: number): string {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function categoryBadge(type: 'BULK' | 'BLOCK', styles: Record<string, string>) {
    return type === 'BULK' ? styles.bulkBadge : styles.blockBadge;
}

export default async function BulkDealsPage() {
    const deals = await fetchTodayDeals();

    const totalValue = deals.reduce((s, d) => s + d.valueCr, 0);
    const bulkCount = deals.filter(d => d.type === 'BULK').length;
    const blockCount = deals.filter(d => d.type === 'BLOCK').length;
    const buyDeals = deals.filter(d => d.buySell === 'BUY');
    const sellDeals = deals.filter(d => d.buySell === 'SELL');
    const buyValue = buyDeals.reduce((s, d) => s + d.valueCr, 0);
    const sellValue = sellDeals.reduce((s, d) => s + d.valueCr, 0);

    return (
        <main className={styles.main}>
            <div className="container">
                <SignalNav />

                <div className={styles.header}>
                    <div className={styles.eyebrow}>MARKET ACTIVITY</div>
                    <h1 className={styles.title}>
                        Bulk & Block <span className={styles.accent}>Deals</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Large institutional transactions from the latest trading session. Sorted by deal value.
                    </p>
                    <div className={styles.dateTag}>
                        <span className={styles.dateDot} />
                        Latest trading day · NSE data
                    </div>
                </div>

                {deals.length > 0 ? (
                    <>
                        <div className={styles.statGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Total Deals</div>
                                <div className={styles.statVal}>{deals.length}</div>
                                <div className={styles.statSub}>{bulkCount} bulk · {blockCount} block</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Total Value</div>
                                <div className={styles.statVal} style={{ color: 'var(--primary-brand)' }}>
                                    ₹{Math.round(totalValue).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.statSub}>Latest session total</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Buy Value</div>
                                <div className={styles.statVal} style={{ color: '#22c55e' }}>
                                    ₹{Math.round(buyValue).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.statSub}>{buyDeals.length} buy transactions</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Sell Value</div>
                                <div className={styles.statVal} style={{ color: '#ef4444' }}>
                                    ₹{Math.round(sellValue).toLocaleString('en-IN')} Cr
                                </div>
                                <div className={styles.statSub}>{sellDeals.length} sell transactions</div>
                            </div>
                        </div>

                        <div className={styles.tableSection}>
                            <div className={styles.tableSectionTitle}>All Deals (latest trading day)</div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
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
                                                <td className={styles.dateCell}>{deal.date}</td>
                                                <td>
                                                    <span className={`${styles.badge} ${deal.type === 'BULK' ? styles.bulkBadge : styles.blockBadge}`}>
                                                        {deal.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link href={`/stocks/${deal.symbol}`} className={styles.symbolLink}>
                                                        {deal.symbol}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className={styles.clientName}>{deal.clientName}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${deal.buySell === 'BUY' ? styles.buyBadge : styles.sellBadge}`}>
                                                        {deal.buySell}
                                                    </span>
                                                </td>
                                                <td>{deal.quantity.toLocaleString('en-IN')}</td>
                                                <td>₹{deal.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className={styles.valCell}>₹{inrCr(deal.valueCr)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Bulk vs Block</div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                                A bulk deal is a single transaction of more than 0.5% of a company's equity, disclosed at end of day. A block deal is a negotiated transaction between two parties, executed in the block window (8:45 to 9:00 AM) or regular hours. Both signal significant institutional movement in a stock.
                            </p>
                        </div>

                        <div className={styles.sourceNote}>
                            <ExternalLink size={11} />
                            Source: NSE India · Bulk deals disclosed post-market · Block deals disclosed intraday
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <Building2 size={40} style={{ opacity: 0.25 }} />
                        <h3>No deals for latest session</h3>
                        <p>Bulk and block deal data appears during and after market hours on trading days.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
