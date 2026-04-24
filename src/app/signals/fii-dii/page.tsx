import React from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { fetchFiiDiiToday, fetchFiiDiiHistory } from '@/lib/fiiDii';
import { SignalNav } from '@/components/signals/SignalNav';
import styles from '../shared.module.css';

export const revalidate = 900;

export const metadata = {
    title: 'FII / DII Flows | Staqq Signals',
    description: 'Foreign and Domestic Institutional Investor daily buy/sell flows for Indian stock markets. Live data from NSE.',
};

function inr(n: number): string {
    return Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default async function FiiDiiPage() {
    const [today, history] = await Promise.all([
        fetchFiiDiiToday(),
        fetchFiiDiiHistory(10),
    ]);

    const maxNet = history.length > 0
        ? Math.max(...history.map(d => Math.abs(d.totalNet)), 1)
        : 1;

    return (
        <main className={styles.main}>
            <div className="container">
                <SignalNav />

                <div className={styles.header}>
                    <div className={styles.eyebrow}>INSTITUTIONAL FLOWS</div>
                    <h1 className={styles.title}>
                        FII / DII <span className={styles.accent}>Flows</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Where foreign and domestic institutions are putting money. Updated daily after market close.
                    </p>
                    {today && (
                        <div className={styles.dateTag}>
                            <span className={styles.dateDot} />
                            Data as of {today.date}
                        </div>
                    )}
                </div>

                {today ? (
                    <>
                        <div className={styles.statGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>FII / FPI Net</div>
                                <div className={styles.statVal} style={{ color: today.fii.net >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {today.fii.net >= 0 ? '+' : '−'}₹{inr(today.fii.net)} Cr
                                </div>
                                <div className={styles.statSub}>
                                    Buy ₹{inr(today.fii.buy)} Cr · Sell ₹{inr(today.fii.sell)} Cr
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>DII Net</div>
                                <div className={styles.statVal} style={{ color: today.dii.net >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {today.dii.net >= 0 ? '+' : '−'}₹{inr(today.dii.net)} Cr
                                </div>
                                <div className={styles.statSub}>
                                    Buy ₹{inr(today.dii.buy)} Cr · Sell ₹{inr(today.dii.sell)} Cr
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Combined Net</div>
                                <div className={styles.statVal} style={{ color: today.totalNet >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {today.totalNet >= 0 ? '+' : '−'}₹{inr(today.totalNet)} Cr
                                </div>
                                <div className={styles.statSub}>FII + DII total</div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Market Pulse</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                    {today.totalNet > 500
                                        ? <TrendingUp size={20} color="#22c55e" />
                                        : today.totalNet < -500
                                        ? <TrendingDown size={20} color="#ef4444" />
                                        : <Minus size={20} color="#f59e0b" />
                                    }
                                    <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: today.totalNet >= 0 ? '#22c55e' : '#ef4444' }}>
                                        {today.totalNet >= 0 ? 'Net Buying' : 'Net Selling'}
                                    </span>
                                </div>
                                <div className={styles.statSub}>
                                    {today.fii.net >= 0 ? 'FII buying' : 'FII selling'} · {today.dii.net >= 0 ? 'DII buying' : 'DII selling'}
                                </div>
                            </div>
                        </div>

                        {history.length > 1 && (
                            <div className={styles.trendSection}>
                                <div className={styles.trendHeader}>
                                    <span className={styles.trendTitle}>10-Day Combined Net Flow</span>
                                    <div className={styles.trendLegend}>
                                        <span className={styles.trendLegendItem}>
                                            <span className={styles.trendLegendDot} style={{ background: '#22c55e' }} />
                                            Net buy
                                        </span>
                                        <span className={styles.trendLegendItem}>
                                            <span className={styles.trendLegendDot} style={{ background: '#ef4444' }} />
                                            Net sell
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.trendBars}>
                                    <div className={styles.trendZero} />
                                    {history.map((day, i) => {
                                        const pct = Math.max(4, Math.round((Math.abs(day.totalNet) / maxNet) * 52));
                                        const parts = day.date.split('-');
                                        const label = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : day.date;
                                        return (
                                            <div key={i} className={styles.trendDay} title={`${day.date}: ${day.totalNet >= 0 ? '+' : '−'}₹${inr(day.totalNet)} Cr`}>
                                                <div className={day.totalNet >= 0 ? styles.trendBarPos : styles.trendBarNeg} style={{ height: pct }} />
                                                <span className={styles.trendDayLabel}>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className={styles.tableSection}>
                            <div className={styles.tableSectionTitle}>Today's Breakdown</div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Buy (₹ Cr)</th>
                                            <th>Sell (₹ Cr)</th>
                                            <th>Net (₹ Cr)</th>
                                            <th>Signal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[{ label: 'FII / FPI', vals: today.fii }, { label: 'DII', vals: today.dii }].map(({ label, vals }) => (
                                            <tr key={label}>
                                                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</td>
                                                <td className={styles.positive}>₹{inr(vals.buy)}</td>
                                                <td className={styles.negative}>₹{inr(vals.sell)}</td>
                                                <td className={vals.net >= 0 ? styles.positive : styles.negative}>
                                                    {vals.net >= 0 ? '+' : '−'}₹{inr(vals.net)}
                                                </td>
                                                <td><span className={vals.net >= 0 ? styles.buyBadge : styles.sellBadge}>{vals.net >= 0 ? 'Net Buy' : 'Net Sell'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>How to read this</div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                                FII/FPI are global funds (BlackRock, Vanguard, sovereign funds). Their moves signal global risk appetite for India. DII includes mutual funds and insurance companies (LIC, SBI MF) — they typically buy when FII sells. When both are net buyers, it is broadly bullish. When FII sells and DII absorbs, the market holds steady. When both sell together, watch for corrections.
                            </p>
                        </div>

                        <div className={styles.sourceNote}>
                            <ExternalLink size={11} />
                            Source: NSE India · Published after market close (~7–8 PM IST on trading days)
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <TrendingUp size={40} style={{ opacity: 0.25 }} />
                        <h3>Data not available yet</h3>
                        <p>FII/DII data is published after market close. Check back after 7 PM IST on trading days.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
