import React from 'react';
import Link from 'next/link';
import { Users, ExternalLink } from 'lucide-react';
import { fetchInsiderTrades } from '@/lib/insiderTrades';
import { SignalNav } from '@/components/signals/SignalNav';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'Insider Trades | Staqq Signals',
    description: 'Track promoter and insider trading disclosures from NSE. See what company insiders are buying and selling.',
};

function categoryBadgeClass(cat: string): string {
    const c = cat.toLowerCase();
    if (c.includes('promoter')) return styles.promoterBadge;
    if (c.includes('director')) return styles.directorBadge;
    if (c.includes('kmp') || c.includes('key')) return styles.kmpBadge;
    return styles.genericBadge;
}

function simplifyMode(mode: string): string {
    const m = mode.toLowerCase();
    if (m.includes('purchase') || m.includes('buy')) return 'Purchase';
    if (m.includes('sale') || m.includes('sell')) return 'Sale';
    return mode;
}

function isBuyMode(mode: string): boolean {
    const m = mode.toLowerCase();
    return m.includes('purchase') || m.includes('buy');
}

export default async function InsiderTradesPage() {
    const trades = await fetchInsiderTrades(14);

    const buyTrades = trades.filter(t => isBuyMode(t.acquireMode));
    const sellTrades = trades.filter(t => !isBuyMode(t.acquireMode));
    const uniqueSymbols = new Set(trades.map(t => t.symbol)).size;

    return (
        <main className={styles.main}>
            <div className="container">
                <SignalNav />

                <div className={styles.header}>
                    <div className={styles.eyebrow}>CORPORATE GOVERNANCE</div>
                    <h1 className={styles.title}>
                        Insider <span className={styles.accent}>Trades</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Promoter and insider trading disclosures from the last 14 days. Filed under SEBI PIT regulations.
                    </p>
                    <div className={styles.dateTag}>
                        <span className={styles.dateDot} />
                        Last 14 trading days · NSE PIT data
                    </div>
                </div>

                {trades.length > 0 ? (
                    <>
                        <div className={styles.statGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Total Disclosures</div>
                                <div className={styles.statVal}>{trades.length}</div>
                                <div className={styles.statSub}>{uniqueSymbols} unique companies</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Buy Transactions</div>
                                <div className={styles.statVal} style={{ color: '#22c55e' }}>{buyTrades.length}</div>
                                <div className={styles.statSub}>Market purchases</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Sell Transactions</div>
                                <div className={styles.statVal} style={{ color: '#ef4444' }}>{sellTrades.length}</div>
                                <div className={styles.statSub}>Market sales</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Buy / Sell Ratio</div>
                                <div
                                    className={styles.statVal}
                                    style={{ color: buyTrades.length >= sellTrades.length ? '#22c55e' : '#ef4444' }}
                                >
                                    {sellTrades.length === 0 ? '∞' : (buyTrades.length / sellTrades.length).toFixed(1)}x
                                </div>
                                <div className={styles.statSub}>
                                    {buyTrades.length >= sellTrades.length ? 'Insiders buying more' : 'Insiders selling more'}
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableSection}>
                            <div className={styles.tableSectionTitle}>All Disclosures (last 14 days)</div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Symbol</th>
                                            <th>Person</th>
                                            <th>Category</th>
                                            <th>Transaction</th>
                                            <th>Shares</th>
                                            <th>Before %</th>
                                            <th>After %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map((trade, i) => (
                                            <tr key={i}>
                                                <td className={styles.dateCell}>{trade.transactionDate}</td>
                                                <td>
                                                    <Link href={`/stocks/${trade.symbol}`} className={styles.symbolLink}>
                                                        {trade.symbol}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className={styles.clientName}>{trade.personName}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${categoryBadgeClass(trade.personCategory)}`}>
                                                        {trade.personCategory}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${isBuyMode(trade.acquireMode) ? styles.buyBadge : styles.sellBadge}`}>
                                                        {simplifyMode(trade.acquireMode)}
                                                    </span>
                                                </td>
                                                <td>{trade.sharesAcquired.toLocaleString('en-IN')}</td>
                                                <td className={styles.dateCell}>{trade.beforePercent}%</td>
                                                <td className={styles.dateCell}>{trade.afterPercent}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>What is PIT?</div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                                Under SEBI's Prohibition of Insider Trading (PIT) Regulations, company insiders (promoters, directors, KMPs) must disclose all trades above 10 lakh rupees within 2 trading days. These filings are a leading indicator of insider conviction, since insiders have the most accurate view of business fundamentals.
                            </p>
                        </div>

                        <div className={styles.sourceNote}>
                            <ExternalLink size={11} />
                            Source: NSE India · PIT disclosures filed within 2 trading days of transaction
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <Users size={40} style={{ opacity: 0.25 }} />
                        <h3>No insider trades in the last 14 days</h3>
                        <p>PIT disclosures appear here once filed by company insiders with NSE.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
