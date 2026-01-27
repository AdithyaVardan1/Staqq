
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StockCard.module.css';

interface StockCardProps {
    ticker: string;
    name: string;
    price: number;
    change: number; // Percent change
    marketCap: string;
    peRatio: number;
}

export const StockCard: React.FC<StockCardProps> = ({
    ticker,
    name,
    price,
    change,
    marketCap,
    peRatio,
}) => {
    const isPositive = change >= 0;
    const changeColor = isPositive ? 'var(--status-success)' : 'var(--status-danger)';

    return (
        <Card hoverEffect className={styles.container}>
            <Link href={`/stocks/${ticker}`} className={styles.link}>
                <div className={styles.header}>
                    <div className={styles.logo}>{name.charAt(0)}</div>
                    <div>
                        <h4 className={styles.ticker}>{ticker}</h4>
                        <div className={styles.name}>{name}</div>
                    </div>
                </div>

                <div className={styles.priceSection}>
                    <div className={styles.price}>₹{price.toFixed(2)}</div>
                    <div className={styles.change} style={{ color: changeColor }}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                </div>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <span>M.Cap</span>
                        <span>{marketCap}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span>P/E</span>
                        <span>{peRatio}</span>
                    </div>
                </div>
            </Link>
        </Card>
    );
};
