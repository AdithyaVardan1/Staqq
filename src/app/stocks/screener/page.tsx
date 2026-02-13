
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockCard } from '@/components/stocks/StockCard';
import { StockTable } from '@/components/stocks/StockTable';
import { StockCardSkeleton } from '@/components/stocks/StockCardSkeleton';
import { BackToTop } from '@/components/ui/BackToTop';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useDebounce } from '@/hooks/useDebounce';
import { Filter, Info, LayoutGrid, List, ArrowUpDown, X, Loader2, AlertCircle, Activity } from 'lucide-react';
import clsx from 'clsx';
import styles from './page.module.css';

// Mock Data Enhanced
// STOCKS constant removed as we use API

interface Stock {
    ticker: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changeAmount: number;
    marketCap: number;
    peRatio: number;
    return1Y: number;
    sector: string;
    debt: string;
    sparklineData: number[];
}

const INITIAL_FILTERS = {
    priceRange: 10000,
    marketCaps: ['Large Cap'],
    sector: 'all',
    performance: 'today',
    divYield: 0,
    peRatio: 50,
    debt: 'all'
};

const RecentlyViewedSection = () => {
    const [recent, setRecent] = useState<string[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/user/recently-viewed');
                const data = await res.json();
                if (data.stocks) {
                    setRecent(data.stocks.map((s: any) => s.symbol).slice(0, 8));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchRecent();
    }, []);

    if (recent.length === 0) return null;

    return (
        <div className={styles.trendingSection}>
            <div className={styles.trendingHeader}>
                <Activity size={16} className={styles.trendingIcon} />
                <span className={styles.trendingLabel}>RECENTLY VIEWED:</span>
            </div>
            <div className={styles.trendingList}>
                {recent.map(symbol => (
                    <Link key={symbol} href={`/stocks/${symbol}`} className={styles.trendingTag}>
                        {symbol}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default function StockScreener() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const debouncedFilters = useDebounce(filters, 300);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [sortBy, setSortBy] = useState('marketCap');
    // The `recentlyViewed` state here seems to duplicate the functionality of `RecentlyViewedSection`.
    // If `RecentlyViewedSection` is a separate component, this state might not be needed in StockScreener
    // unless StockScreener itself needs to display or interact with the full list of recently viewed stocks.
    // For now, keeping it as per original code, but noting potential redundancy.
    const [recentlyViewed, setRecentlyViewed] = useState<Stock[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/user/recently-viewed');
                const data = await res.json();
                if (data.stocks) {
                    // Deduplicate by symbol
                    const uniqueStocks = data.stocks.filter((stock: any, index: number, self: any[]) =>
                        index === self.findIndex((s) => s.symbol === stock.symbol)
                    );
                    setRecentlyViewed(uniqueStocks);
                }
            } catch (e) {
                console.error('Failed to fetch recent stocks:', e);
            }
        };
        fetchRecent();
    }, []);

    const fetchStocks = useCallback(async (offset: number) => {
        const params = new URLSearchParams({
            offset: offset.toString(),
            limit: '10',
            priceMin: '0',
            priceMax: debouncedFilters.priceRange.toString(),
            sector: debouncedFilters.sector,
            peMax: debouncedFilters.peRatio.toString(),
            marketCap: debouncedFilters.marketCaps.join(','),
        });

        const res = await fetch(`/api/stocks/screener?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch stocks');

        const data = await res.json();
        return {
            items: data.stocks,
            hasMore: data.hasMore,
            total: data.total,
            nextOffset: data.nextOffset
        };
    }, [debouncedFilters]);

    const {
        items: stocks,
        isLoading,
        error,
        total,
        loadMore,
        intersectionRef,
        showLoadMoreButton
    } = useInfiniteScroll<Stock>({
        fetchData: fetchStocks,
        dependencies: [debouncedFilters], // Reset on debounced filter change
        maxAutoLoads: 10,
        limit: 10
    });

    const handleClearAll = () => {
        setFilters({
            ...INITIAL_FILTERS,
            marketCaps: [],
            peRatio: 100,
            performance: 'today',
            sector: 'all',
            debt: 'all'
        });
    };

    const removeMarketCap = (cap: string) => {
        setFilters(prev => ({
            ...prev,
            marketCaps: prev.marketCaps.filter(c => c !== cap)
        }));
    };

    // Memoized filtered stocks removed in favor of useInfiniteScroll's items

    const sortedStocks = useMemo(() => {
        return [...stocks].sort((a, b) => {
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'pe') return a.peRatio - b.peRatio;
            if (sortBy === 'returns') return b.return1Y - a.return1Y;
            if (sortBy === 'marketCap') {
                return b.marketCap - a.marketCap;
            }
            return 0;
        });
    }, [stocks, sortBy]);

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Stock Screener</h1>
                    <div className={styles.headerActions}>
                        <Button variant="secondary" size="sm" className={styles.filterToggle}>
                            <Filter size={16} /> Filters
                        </Button>
                    </div>
                </div>

                <RecentlyViewedSection />

                <div className={styles.layout}>
                    {/* Sidebar Filters (Desktop) */}
                    <aside className={styles.sidebar}>
                        <Card className={styles.filterCard} variant="glass">
                            {/* Price Range */}
                            <div className={styles.filterGroup}>
                                <div className={styles.filterTitleRow}>
                                    <h4 className={styles.filterTitle}>Price Range</h4>
                                    <span className={styles.filterValue}>₹{filters.priceRange.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    className={styles.range}
                                    value={filters.priceRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: parseInt(e.target.value) }))}
                                    suppressHydrationWarning
                                />
                                <div className={styles.rangeLabels}>
                                    <span>₹0</span>
                                    <span>₹10,000+</span>
                                </div>
                            </div>

                            {/* Market Cap */}
                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Market Cap</h4>
                                {['Large Cap', 'Mid Cap', 'Small Cap'].map(cap => (
                                    <label key={cap} className={styles.checkbox}>
                                        <input
                                            type="checkbox"
                                            checked={filters.marketCaps.includes(cap)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFilters(prev => ({
                                                    ...prev,
                                                    marketCaps: checked
                                                        ? [...prev.marketCaps, cap]
                                                        : prev.marketCaps.filter(c => c !== cap)
                                                }));
                                            }}
                                            suppressHydrationWarning
                                        />
                                        {cap}
                                        <span className={styles.infoIconWrapper}>
                                            <Info size={14} className={styles.infoIcon} />
                                            <span className={styles.tooltip}>
                                                {cap === 'Large Cap' ? 'Companies worth >₹20,000 Cr' :
                                                    cap === 'Mid Cap' ? 'Worth ₹5,000 - ₹20,000 Cr' :
                                                        'Worth <₹5,000 Cr'}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Sector */}
                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Sector</h4>
                                <select
                                    className={styles.select}
                                    value={filters.sector}
                                    onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                                    suppressHydrationWarning
                                >
                                    <option value="all">All Sectors</option>
                                    <option value="it">IT Services</option>
                                    <option value="banking">Banking</option>
                                    <option value="energy">Energy</option>
                                    <option value="consumer">Consumer Goods</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="automobile">Automobile</option>
                                </select>
                            </div>

                            {/* Performance */}
                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Performance</h4>
                                <select
                                    className={styles.select}
                                    value={filters.performance}
                                    onChange={(e) => setFilters(prev => ({ ...prev, performance: e.target.value }))}
                                    suppressHydrationWarning
                                >
                                    <option value="today">Top Gainers Today</option>
                                    <option value="1w">Last 1 Week</option>
                                    <option value="1m">Last 1 Month</option>
                                    <option value="1y">Last 1 Year</option>
                                </select>
                            </div>

                            {/* Dividend Yield */}
                            <div className={styles.filterGroup}>
                                <div className={styles.filterTitleRow}>
                                    <h4 className={styles.filterTitle}>Dividend Yield</h4>
                                    <span className={styles.filterValue}>{filters.divYield}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    className={styles.range}
                                    value={filters.divYield}
                                    onChange={(e) => setFilters(prev => ({ ...prev, divYield: parseFloat(e.target.value) }))}
                                    suppressHydrationWarning
                                />
                                <div className={styles.rangeLabels}>
                                    <span>0%</span>
                                    <span>10%+</span>
                                </div>
                            </div>

                            {/* P/E Ratio */}
                            <div className={styles.filterGroup}>
                                <div className={styles.filterTitleRow}>
                                    <h4 className={styles.filterTitle}>P/E Ratio</h4>
                                    <span className={styles.filterValue}>Under {filters.peRatio}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    className={styles.range}
                                    value={filters.peRatio}
                                    onChange={(e) => setFilters(prev => ({ ...prev, peRatio: parseInt(e.target.value) }))}
                                    suppressHydrationWarning
                                />
                                <div className={styles.peGradient}></div>
                                <div className={styles.rangeLabels}>
                                    <span className={styles.undervalued}>Undervalued</span>
                                    <span className={styles.overvalued}>Overvalued</span>
                                </div>
                            </div>

                            {/* Debt-to-Equity */}
                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Debt-to-Equity</h4>
                                <div className={styles.radioGroup}>
                                    {['all', 'low', 'medium', 'high'].map(d => (
                                        <label key={d} className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="debt"
                                                value={d}
                                                checked={filters.debt === d}
                                                onChange={(e) => setFilters(prev => ({ ...prev, debt: e.target.value }))}
                                                suppressHydrationWarning
                                            />
                                            <span style={{ textTransform: 'capitalize' }}>{d === 'all' ? 'Any' : d}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Results Container */}
                    <div className={styles.results}>
                        <div className={styles.resultsToolbar}>
                            <div className={styles.resultsInfo}>
                                <span className={styles.resultCount}>{total} stocks found</span>
                                <span className={styles.previewNote}>
                                    Showing {stocks.length} of {total}
                                </span>
                            </div>

                            <div className={styles.activeFilters}>
                                {filters.marketCaps.map(cap => (
                                    <div key={cap} className={styles.filterBadge}>
                                        {cap}
                                        <span className={styles.removeFilter} onClick={() => removeMarketCap(cap)}>
                                            <X size={12} />
                                        </span>
                                    </div>
                                ))}
                                {filters.peRatio < 100 && (
                                    <div className={styles.filterBadge}>
                                        P/E Under {filters.peRatio}
                                        <span className={styles.removeFilter} onClick={() => setFilters(prev => ({ ...prev, peRatio: 100 }))}>
                                            <X size={12} />
                                        </span>
                                    </div>
                                )}
                                {filters.sector !== 'all' && (
                                    <div className={styles.filterBadge}>
                                        Sector: {filters.sector}
                                        <span className={styles.removeFilter} onClick={() => setFilters(prev => ({ ...prev, sector: 'all' }))}>
                                            <X size={12} />
                                        </span>
                                    </div>
                                )}
                                {(filters.marketCaps.length > 0 || filters.peRatio < 100 || filters.sector !== 'all') && (
                                    <span className={styles.clearAll} onClick={handleClearAll}>Clear All</span>
                                )}
                            </div>
                            {recentlyViewed.length > 0 && (
                                <section className={styles.recentlyViewedSection}>
                                    <h2 className={styles.rvTitle}>
                                        <Activity size={20} className="text-brand" /> Recently Viewed
                                    </h2>
                                    <div className={styles.rvGrid}>
                                        {recentlyViewed.map(stock => (
                                            <StockCard
                                                key={`rv-${stock.symbol}`}
                                                {...stock}
                                                marketCap={formatMarketCap(stock.marketCap)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className={styles.toolbarRight}>
                                <div className={styles.sortDropdown}>
                                    <ArrowUpDown size={14} className={styles.sortIcon} />
                                    <select
                                        className={styles.compactSelect}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        suppressHydrationWarning
                                    >
                                        <option value="marketCap">Market Cap</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="pe">P/E Ratio</option>
                                        <option value="returns">1Y Returns</option>
                                    </select>
                                </div>

                                <div className={styles.viewToggle}>
                                    <button
                                        className={clsx(styles.toggleBtn, { [styles.active]: viewMode === 'card' })}
                                        onClick={() => setViewMode('card')}
                                        title="Card View"
                                        suppressHydrationWarning
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        className={clsx(styles.toggleBtn, { [styles.active]: viewMode === 'table' })}
                                        onClick={() => setViewMode('table')}
                                        title="Table View"
                                        suppressHydrationWarning
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && !isLoading && (
                            <Card variant="glass" className={styles.emptyState}>
                                <AlertCircle size={48} className={styles.emptyIcon} style={{ color: 'var(--status-danger)' }} />
                                <h3>Oops! Something went wrong</h3>
                                <p>We couldn't load the stocks. Please try again.</p>
                                <Button variant="primary" onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            </Card>
                        )}

                        {/* Empty State */}
                        {!error && !isLoading && stocks.length === 0 && (
                            <Card variant="glass" className={styles.emptyState}>
                                <Filter size={48} className={styles.emptyIcon} />
                                <h3>No stocks found</h3>
                                <p>Try adjusting your filters to see more results</p>
                                <Button variant="secondary" onClick={handleClearAll}>
                                    Clear All Filters
                                </Button>
                            </Card>
                        )}

                        {recentlyViewed.length > 0 && (
                            <div className={styles.recentlyViewedContainer}>
                                <section className={styles.recentlyViewedSection}>
                                    <h2 className={styles.rvTitle}>
                                        <Activity size={20} className="text-brand" /> Recently Viewed
                                    </h2>
                                    <div className={styles.rvGrid}>
                                        {recentlyViewed.map(stock => (
                                            <StockCard
                                                key={`rv-${stock.symbol}`}
                                                {...stock}
                                                marketCap={formatMarketCap(stock.marketCap)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {stocks.length > 0 || isLoading ? (
                            <>
                                {viewMode === 'card' ? (
                                    <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                        {sortedStocks.map((stock) => (
                                            <StockCard
                                                key={stock.symbol}
                                                {...stock}
                                                marketCap={formatMarketCap(stock.marketCap)}
                                            />
                                        ))}

                                        {isLoading && [...Array(3)].map((_, i) => (
                                            <StockCardSkeleton key={`skeleton-${i}`} />
                                        ))}
                                    </div>
                                ) : (
                                    <StockTable stocks={sortedStocks} />
                                )}

                                {/* Infinite Scroll Trigger */}
                                <div ref={intersectionRef} className={styles.infiniteTrigger}>
                                    {isLoading && stocks.length > 0 && (
                                        <div className={styles.loadingMore}>
                                            <Loader2 className={styles.spinner} />
                                            <span>Loading more stocks...</span>
                                        </div>
                                    )}
                                </div>

                                {showLoadMoreButton && (
                                    <div className={styles.loadMoreWrapper}>
                                        <Button
                                            variant="secondary"
                                            onClick={() => loadMore()}
                                            className={styles.loadMoreBtn}
                                        >
                                            Show More Results
                                        </Button>
                                    </div>
                                )}

                                {!isLoading && !showLoadMoreButton && stocks.length > 0 && stocks.length >= total && (
                                    <div className={styles.endMessage}>
                                        You've reached the end of results
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No stocks match your filters.</p>
                                <Button variant="secondary" size="sm" onClick={handleClearAll} style={{ marginTop: '12px' }}>
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BackToTop />
        </main>
    );
}

// Helper
function formatMarketCap(value: number) {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
    return value.toLocaleString();
}
