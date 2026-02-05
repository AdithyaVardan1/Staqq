
'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { StockLogo } from './StockLogo';
import styles from './StockTable.module.css';

interface StockTableProps {
    stocks: any[];
}

export const StockTable: React.FC<StockTableProps> = ({ stocks }) => {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.thMain}>Company</th>
                        <th>Price</th>
                        <th>Change</th>
                        <th>M. Cap</th>
                        <th>P/E</th>
                        <th>1Y Return</th>
                        <th className={styles.thChart}>1M Trend</th>
                        <th className={styles.thAction}></th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock) => {
                        const isPositive = stock.change >= 0;
                        const isReturnPositive = stock.return1Y >= 0;
                        const changeColor = isPositive ? 'var(--status-success)' : 'var(--status-danger)';

                        return (
                            <tr key={stock.ticker} className={styles.row}>
                                <td className={styles.tdMain}>
                                    <div className={styles.header}>
                                        <StockLogo ticker={stock.ticker} name={stock.name} size="sm" />
                                        <div>
                                            <div className={styles.ticker}>{stock.ticker}</div>
                                            <div className={styles.name}>{stock.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.tdNumber}>
                                    <div className={styles.price}>₹{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </td>
                                <td className={styles.tdNumber}>
                                    <div className={styles.change} style={{ color: changeColor }}>
                                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {isPositive ? '+' : ''}{stock.change}%
                                    </div>
                                </td>
                                <td className={styles.tdNumber}>{stock.marketCap}</td>
                                <td className={styles.tdNumber}>{stock.peRatio}</td>
                                <td className={styles.tdNumber}>
                                    <span style={{ color: isReturnPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                                        {isReturnPositive ? '+' : ''}{stock.return1Y}%
                                    </span>
                                </td>
                                <td className={styles.tdChart}>
                                    <div className={styles.sparklineWrapper}>
                                        <Sparkline data={stock.sparklineData} isPositive={isPositive} height={30} />
                                    </div>
                                </td>
                                <td className={styles.tdAction}>
                                    <Link href={`/stocks/${stock.ticker}`} className={styles.viewLink}>
                                        View <ChevronRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
