
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockCard } from '@/components/stocks/StockCard';
import { Filter } from 'lucide-react';
import styles from './page.module.css';

// Mock Data
const STOCKS = [
    { ticker: 'RELIANCE', name: 'Reliance Industries', price: 2450.50, change: 1.2, marketCap: '16.5T', peRatio: 24.5 },
    { ticker: 'TCS', name: 'Tata Consultancy Svcs', price: 3400.00, change: -0.5, marketCap: '12.4T', peRatio: 29.1 },
    { ticker: 'HDFCBANK', name: 'HDFC Bank', price: 1650.75, change: 0.8, marketCap: '9.2T', peRatio: 18.4 },
    { ticker: 'INFY', name: 'Infosys Ltd', price: 1450.20, change: -1.2, marketCap: '6.1T', peRatio: 22.8 },
    { ticker: 'ITC', name: 'ITC Limited', price: 450.00, change: 2.5, marketCap: '5.6T', peRatio: 26.5 },
];

export default function StockScreener() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Stock Screener</h1>
                    <Button variant="secondary" size="sm" className={styles.filterToggle}>
                        <Filter size={16} /> Filters
                    </Button>
                </div>

                <div className={styles.layout}>
                    {/* Sidebar Filters (Desktop) */}
                    <aside className={styles.sidebar}>
                        <Card className={styles.filterCard} variant="glass">
                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Market Cap</h4>
                                <label className={styles.checkbox}><input type="checkbox" defaultChecked /> Large Cap</label>
                                <label className={styles.checkbox}><input type="checkbox" /> Mid Cap</label>
                                <label className={styles.checkbox}><input type="checkbox" /> Small Cap</label>
                            </div>

                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>Sector</h4>
                                <select className={styles.select}>
                                    <option>All Sectors</option>
                                    <option>IT Services</option>
                                    <option>Banking</option>
                                    <option>Energy</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <h4 className={styles.filterTitle}>P/E Ratio</h4>
                                <input type="range" min="0" max="100" className={styles.range} />
                                <div className={styles.rangeLabels}>
                                    <span>0</span>
                                    <span>100+</span>
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Results Grid */}
                    <div className={styles.results}>
                        <div className={styles.activeFilters}>
                            <Badge variant="neutral" size="sm">Large Cap <span style={{ marginLeft: 4, cursor: 'pointer' }}>×</span></Badge>
                            <Badge variant="neutral" size="sm">P/E &lt; 50 <span style={{ marginLeft: 4, cursor: 'pointer' }}>×</span></Badge>
                            <span className={styles.clearAll}>Clear All</span>
                        </div>

                        <div className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            {STOCKS.map((stock) => (
                                <StockCard key={stock.ticker} {...stock} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
