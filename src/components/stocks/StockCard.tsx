
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, ChevronRight, Activity } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { StockLogo } from './StockLogo';
import { useLiveMarketData } from '@/hooks/useLiveMarketData';
import styles from './StockCard.module.css';

interface StockCardProps {
    ticker: string;
    name: string;
    price: number;
    change: number; // Percent change
    changeAmount: number; // Price change in ₹
    marketCap: string;
    peRatio: number;
    return1Y: number;
    sparklineData: number[];
}

export const StockCard: React.FC<StockCardProps> = ({
    ticker,
    name,
    price: initialPrice,
    change: initialChange,
    changeAmount: initialChangeAmount,
    marketCap,
    peRatio,
    return1Y,
    sparklineData,
}) => {
    const { price, change, changePercent, status } = useLiveMarketData(ticker, initialPrice);

    // Live calculations
    const displayPrice = price;

    // Use live change if available, otherwise fallback to initial props
    // This avoids incorrect calculations when mixing real price with mock open price
    const currentChange = changePercent !== undefined ? changePercent : initialChange;
    const currentChangeAmount = change !== undefined ? change : initialChangeAmount;
    const isPositive = currentChange >= 0;
    const isReturnPositive = return1Y >= 0;
    const changeColor = isPositive ? 'var(--status-success)' : 'var(--status-danger)';

    return (
        <Card hoverEffect className={styles.container}>
            <div className={styles.cardContent}>
                <div className={styles.header}>
                    <StockLogo ticker={ticker} name={name} size="md" />
                    <div className={styles.tickerInfo}>
                        <div className={styles.tickerHeader}>
                            <h4 className={styles.ticker}>{ticker}</h4>
                            {status === 'connected' && (
                                <span className={styles.liveIndicator} title="Live Data Stream">
                                    <Activity size={10} /> LIVE
                                </span>
                            )}
                        </div>
                        <div className={styles.name}>{name}</div>
                    </div>
                </div>

                <div className={styles.priceRow}>
                    <div className={styles.priceSection}>
                        <div className={styles.price}>₹{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className={styles.change} style={{ color: changeColor }}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPositive ? '+' : ''}{currentChange.toFixed(2)}% (₹{Math.abs(currentChangeAmount).toFixed(2)})
                        </div>
                    </div>
                    <div className={styles.chartSection}>
                        <Sparkline data={sparklineData} isPositive={isPositive} />
                    </div>
                </div>

                <div className={styles.metrics}>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>M. Cap</span>
                        <span className={styles.metricValue}>{marketCap}</span>
                    </div>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>P/E</span>
                        <span className={styles.metricValue}>{peRatio}</span>
                    </div>
                    <div className={styles.metric}>
                        <span className={styles.metricLabel}>1Y Return</span>
                        <span className={styles.metricValue} style={{ color: isReturnPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                            {isReturnPositive ? '+' : ''}{return1Y}%
                        </span>
                    </div>
                </div>

                <Link href={`/stocks/${ticker}`} className={styles.detailsLink}>
                    <Button variant="secondary" fullWidth size="sm" className={styles.detailsButton}>
                        View Details <ChevronRight size={14} />
                    </Button>
                </Link>
            </div>
        </Card>
    );
};
