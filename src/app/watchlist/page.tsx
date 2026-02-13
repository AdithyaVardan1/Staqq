
'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Trash2 } from 'lucide-react';
import styles from './page.module.css';

import { useWatchlist } from '@/hooks/useWatchlist';

const WatchlistItem = ({ symbol, onRemove }: { symbol: string; onRemove: (s: string) => void }) => {
    const [data, setData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/stocks/fundamentals?ticker=${symbol.split('.')[0]}`);
                const result = await res.json();
                if (result.fundamentals) {
                    setData(result.fundamentals);
                }
            } catch (error) {
                console.error('Failed to fetch item data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    if (isLoading) return <Card className={styles.itemCard}><div className="p-4 opacity-50">Loading {symbol}...</div></Card>;
    if (!data) return null;

    return (
        <Card className={styles.itemCard}>
            <div className={styles.itemContent}>
                <div className={styles.itemInfo}>
                    <span className={styles.itemType}>STOCK</span>
                    <h3 className={styles.itemName}>{symbol}</h3>
                    <div className={styles.itemMeta}>
                        <span className={styles.itemPrice}>₹{data.price?.toLocaleString() || 'N/A'}</span>
                        <span className={`${styles.itemChange} ${(data.percentChange || 0) >= 0 ? styles.positive : ''}`}>
                            {(data.percentChange || 0) >= 0 ? '+' : ''}{(data.percentChange || 0).toFixed(2)}%
                        </span>
                    </div>
                </div>
                <div className={styles.itemActions}>
                    <Link href={`/stocks/${symbol.split('.')[0]}`}>
                        <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <button
                        className={styles.deleteBtn}
                        aria-label="Remove"
                        onClick={() => onRemove(symbol)}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default function WatchlistPage() {
    const { watchlist, removeFromWatchlist, isLoading } = useWatchlist();

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Your <span className="text-brand">Watchlist</span></h1>
                    <p className={styles.subtitle}>Track your favorite stocks in one place.</p>
                </div>

                <div className={styles.grid}>
                    {isLoading ? (
                        <div className="text-center py-20 opacity-50">Loading your watchlist...</div>
                    ) : watchlist.length > 0 ? (
                        watchlist.map((symbol) => (
                            <WatchlistItem
                                key={symbol}
                                symbol={symbol}
                                onRemove={removeFromWatchlist}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <TrendingUp size={48} className="text-brand mb-4" />
                            <h3>Your watchlist is empty</h3>
                            <p>Start exploring to add items here.</p>
                            <Link href="/stocks/screener">
                                <Button variant="primary" className="mt-4">Explore Stocks</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
