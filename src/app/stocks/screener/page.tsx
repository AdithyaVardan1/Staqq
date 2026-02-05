
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockCard } from '@/components/stocks/StockCard';
import { StockTable } from '@/components/stocks/StockTable';
import { Filter, Info, LayoutGrid, List, ArrowUpDown, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './page.module.css';

// Mock Data Enhanced
const STOCKS = [
    {
        ticker: 'RELIANCE',
        name: 'Reliance Industries',
        price: 2450.50,
        change: 1.2,
        changeAmount: 29.4,
        marketCap: '16.5T',
        peRatio: 24.5,
        return1Y: 18.2,
        sector: 'energy',
        debt: 'low',
        sparklineData: [2400, 2410, 2390, 2420, 2450, 2440, 2450.5]
    },
    {
        ticker: 'TCS',
        name: 'Tata Consultancy Services',
        price: 3400.00,
        change: -0.5,
        changeAmount: -17.1,
        marketCap: '12.4T',
        peRatio: 29.1,
        return1Y: 12.5,
        sector: 'it',
        debt: 'low',
        sparklineData: [3450, 3420, 3440, 3410, 3390, 3400, 3400]
    },
    {
        ticker: 'HDFCBANK',
        name: 'HDFC Bank',
        price: 1650.75,
        change: 0.8,
        changeAmount: 13.2,
        marketCap: '9.2T',
        peRatio: 18.4,
        return1Y: -5.2,
        sector: 'banking',
        debt: 'medium',
        sparklineData: [1620, 1630, 1640, 1635, 1645, 1650, 1650.75]
    },
    {
        ticker: 'INFY',
        name: 'Infosys Ltd',
        price: 1450.20,
        change: -1.2,
        changeAmount: -17.5,
        marketCap: '6.1T',
        peRatio: 22.8,
        return1Y: 8.4,
        sector: 'it',
        debt: 'low',
        sparklineData: [1480, 1470, 1465, 1460, 1455, 1450, 1450.2]
    },
    {
        ticker: 'ITC',
        name: 'ITC Limited',
        price: 450.00,
        change: 2.5,
        changeAmount: 10.9,
        marketCap: '5.6T',
        peRatio: 26.5,
        return1Y: 32.1,
        sector: 'consumer',
        debt: 'low',
        sparklineData: [430, 435, 438, 442, 445, 448, 450]
    },
];

const INITIAL_FILTERS = {
    priceRange: 10000,
    marketCaps: ['Large Cap'],
    sector: 'all',
    performance: 'today',
    divYield: 0,
    peRatio: 50,
    debt: 'all'
};

export default function StockScreener() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [sortBy, setSortBy] = useState('marketCap');

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

    const filteredStocks = useMemo(() => {
        return STOCKS.filter(stock => {
            // Price Filter
            if (stock.price > filters.priceRange) return false;

            // Sector Filter
            if (filters.sector !== 'all' && stock.sector !== filters.sector) return false;

            // PE Ratio Filter
            if (stock.peRatio > filters.peRatio) return false;

            // Debt Filter
            if (filters.debt !== 'all' && stock.debt !== filters.debt) return false;

            return true;
        });
    }, [filters]);

    const sortedStocks = useMemo(() => {
        return [...filteredStocks].sort((a, b) => {
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'pe') return a.peRatio - b.peRatio;
            if (sortBy === 'returns') return b.return1Y - a.return1Y;
            if (sortBy === 'marketCap') {
                const valA = parseFloat(a.marketCap.replace('T', ''));
                const valB = parseFloat(b.marketCap.replace('T', ''));
                return valB - valA;
            }
            return 0;
        });
    }, [filteredStocks, sortBy]);

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

                        {sortedStocks.length > 0 ? (
                            viewMode === 'card' ? (
                                <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                    {sortedStocks.map((stock) => (
                                        <StockCard key={stock.ticker} {...stock} />
                                    ))}
                                </div>
                            ) : (
                                <StockTable stocks={sortedStocks} />
                            )
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>No stocks match your filters.</p>
                                <Button variant="secondary" size="sm" onClick={handleClearAll} style={{ marginTop: '12px' }}>
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
