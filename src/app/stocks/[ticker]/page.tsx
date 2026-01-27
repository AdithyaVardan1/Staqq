
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { ArrowLeft, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

// Mock Data
const STOCK_DATA = {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2450.50,
    change: 25.40,
    changePercent: 1.2,
    history: [
        { date: '10:00', value: 2420 },
        { date: '11:00', value: 2435 },
        { date: '12:00', value: 2428 },
        { date: '13:00', value: 2442 },
        { date: '14:00', value: 2445 },
        { date: '15:00', value: 2450.50 },
    ],
    stats: {
        marketCap: '16.5T',
        pe: 24.5,
        divYield: '0.8%',
        high52: 2600,
        low52: 2100,
        roe: '14%',
    }
};

export default function StockDetail({ params }: { params: { ticker: string } }) {
    const isPositive = STOCK_DATA.change >= 0;

    return (
        <main className={styles.main}>
            <div className="container">
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <Link href="/stocks/screener" className={styles.backLink}>
                        <ArrowLeft size={20} /> Back to Stocks
                    </Link>
                    <Button variant="outline" size="sm">
                        <Plus size={16} /> Add to Watchlist
                    </Button>
                </div>

                {/* Header */}
                <section className={styles.header}>
                    <div>
                        <div className={styles.tickerBadge}>{STOCK_DATA.ticker}</div>
                        <h1 className={styles.title}>{STOCK_DATA.name}</h1>
                        <div className={styles.priceRow}>
                            <span className={styles.price}>₹{STOCK_DATA.price.toFixed(2)}</span>
                            <span className={styles.change} style={{ color: isPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                                {isPositive ? '+' : ''}{STOCK_DATA.change} ({STOCK_DATA.changePercent}%)
                            </span>
                        </div>
                    </div>

                    <div className={styles.chartControls}>
                        <div className={styles.timeframes}>
                            <button className={`${styles.tfBtn} ${styles.active}`}>1D</button>
                            <button className={styles.tfBtn}>1W</button>
                            <button className={styles.tfBtn}>1M</button>
                            <button className={styles.tfBtn}>1Y</button>
                            <button className={styles.tfBtn}>5Y</button>
                        </div>
                    </div>
                </section>

                {/* Chart */}
                <Card className={styles.chartCard}>
                    <FinancialChart
                        data={STOCK_DATA.history}
                        height={400}
                        color={isPositive ? '#22C55E' : '#EF4444'}
                    />
                </Card>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>Market Cap</div>
                        <div className={styles.statValue}>₹{STOCK_DATA.stats.marketCap}</div>
                    </Card>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>P/E Ratio</div>
                        <div className={styles.statValue}>{STOCK_DATA.stats.pe}</div>
                    </Card>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>Div Yield</div>
                        <div className={styles.statValue}>{STOCK_DATA.stats.divYield}</div>
                    </Card>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>52W High</div>
                        <div className={styles.statValue}>₹{STOCK_DATA.stats.high52}</div>
                    </Card>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>52W Low</div>
                        <div className={styles.statValue}>₹{STOCK_DATA.stats.low52}</div>
                    </Card>
                    <Card className={styles.statCard} variant="glass">
                        <div className={styles.statLabel}>RoE</div>
                        <div className={styles.statValue}>{STOCK_DATA.stats.roe}</div>
                    </Card>
                </div>

                {/* Analysis Section Placeholder */}
                <div className={styles.analysis}>
                    <h2 className={styles.sectionTitle}>Key Analysis</h2>
                    <div className="grid-cols-1 md:grid-cols-2" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        <Card className={styles.analysisCard}>
                            <h3>Fundamental View</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Excellent financial health with strong operating margins.</p>
                            <Badge variant="success" className={styles.badgeTop}>Strong Buy</Badge>
                        </Card>
                        <Card className={styles.analysisCard}>
                            <h3>Technical View</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Trading above 200-day moving average. Bullish momentum.</p>
                            <Badge variant="brand" className={styles.badgeTop}>Bullish</Badge>
                        </Card>
                    </div>
                </div>

            </div>
        </main>
    );
}
