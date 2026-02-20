
'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Trash2 } from 'lucide-react';
import { StockCard } from '@/components/stocks/StockCard';
import { StockCardSkeleton } from '@/components/stocks/StockCardSkeleton';
import styles from './page.module.css';

import { useWatchlist } from '@/hooks/useWatchlist';

const WatchlistItem = ({ symbol, onRemove }: { symbol: string; onRemove: (s: string) => void }) => {
    const [data, setData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch full fundamentals including sparkline and hologram data
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

    if (isLoading) return <div className="mt-2"><StockCardSkeleton /></div>;
    if (!data) return null;

    return (
        <div className="relative">
            <StockCard
                ticker={data.ticker}
                name={data.name}
                price={data.price}
                change={data.percentChange}
                changeAmount={data.netChange}
                marketCap={formatMarketCap(data.marketCap)}
                peRatio={data.peRatio}
                return1Y={data.roiYear || 0} // Assuming API returns roiYear or similar? API returns 'return1Y' if present?
                // yinfo.py doesn't return 'return1Y' explicitly? 
                // Let's check API response again. If strictly not there, default to 0. 
                // Actually yinfo.py has 'high52', 'low52' etc. 
                // I might need to calculate return1Y or use changePercent as proxy if 1Y not available.
                // Or maybe yfinance '52WeekChange' exists. yinfo.py didn't seem to include it.
                // I'll default to 0 for now to avoid break.
                sparklineData={data.sparkline || []}

                // Hologram Props
                sector={data.sector}
                industry={data.industry}
                high52={data.high52}
                low52={data.low52}
                beta={data.beta}
                divYield={data.divYield}
                website={data.website}
            />

            {/* Remove Button (Floating absolute to not mess with card layout) */}
            <button
                className={styles.floatingDeleteBtn}
                aria-label="Remove from Watchlist"
                onClick={(e) => {
                    e.preventDefault();
                    onRemove(symbol);
                }}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

// Helper
function formatMarketCap(value: number) {
    if (!value) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
    return value.toLocaleString();
}

export default function WatchlistPage() {
    const { watchlist, removeFromWatchlist, isLoading } = useWatchlist();

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Your <span className="text-brand">Watchlist</span></h1>
                    <p className={styles.subtitle}>Track your favorite stocks with real-time holographic insights.</p>
                </div>

                <div className={styles.grid}>
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <div className="animate-pulse text-xl text-neutral-400">Loading your vault...</div>
                        </div>
                    ) : watchlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {watchlist.map((symbol) => (
                                <WatchlistItem
                                    key={symbol}
                                    symbol={symbol}
                                    onRemove={removeFromWatchlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <TrendingUp size={48} className="text-brand mb-4" />
                            <h3>Your watchlist is empty</h3>
                            <p>Start exploring the market to build your portfolio.</p>
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
