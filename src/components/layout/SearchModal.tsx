'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './SearchModal.module.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
            fetchRecentSearches();
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(() => {
        const searchStocks = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(searchStocks, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const fetchRecentSearches = async () => {
        try {
            const res = await fetch('/api/user/recent-searches');
            const data = await res.json();
            if (data.tickers) {
                // We only have tickers, but we can show them as mini tags
                setRecentSearches(data.tickers);
            }
        } catch (e) {
            console.error('Failed to fetch recent:', e);
        }
    };

    const handleSelect = async (symbol: string) => {
        try {
            await fetch('/api/user/recent-searches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: symbol })
            });
        } catch (e) {
            console.error('Failed to track search:', e);
        }

        onClose();
        router.push(`/stocks/${symbol}`);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search stocks, indices, or sectors..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className={styles.input}
                    />
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <div className={styles.loading}>Searching...</div>
                    ) : results.length > 0 ? (
                        <div className={styles.resultsList}>
                            <h4 className={styles.sectionTitle}>Results</h4>
                            {results.map((result, index) => (
                                <button
                                    key={`${result.exchange}:${result.symbol}:${index}`}
                                    className={styles.resultItem}
                                    onClick={() => handleSelect(result.symbol)}
                                >
                                    <div className={styles.resultInfo}>
                                        <span className={styles.symbol}>{result.symbol}</span>
                                        <span className={styles.name}>{result.name}</span>
                                    </div>
                                    <div className={styles.resultMeta}>
                                        <span className={styles.exchange}>{result.exchange}</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim().length >= 2 ? (
                        <div className={styles.empty}>No results found for "{query}"</div>
                    ) : (
                        <div className={styles.popular}>
                            {recentSearches.length > 0 && (
                                <>
                                    <h4 className={styles.sectionTitle}>Recent Searches</h4>
                                    <div className={styles.popularGrid} style={{ marginBottom: '2rem' }}>
                                        {recentSearches.map(symbol => (
                                            <button
                                                key={`recent-${symbol}`}
                                                className={styles.popularTag}
                                                onClick={() => handleSelect(symbol)}
                                            >
                                                <Activity size={14} />
                                                {symbol}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h4 className={styles.sectionTitle}>Popular Stocks</h4>
                            <div className={styles.popularGrid}>
                                {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ZOMATO'].map(symbol => (
                                    <button
                                        key={symbol}
                                        className={styles.popularTag}
                                        onClick={() => handleSelect(symbol)}
                                    >
                                        <TrendingUp size={14} />
                                        {symbol}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <span>Press <kbd>ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};
