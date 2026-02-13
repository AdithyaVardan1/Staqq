'use client';

import React, { useState } from 'react';
import { useComparisonStore } from '@/store/useComparisonStore';
import styles from './ComparisonTray.module.css';
import { X, ChevronUp, ChevronDown, BarChart2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export const ComparisonTray = () => {
    const { selectedTickers, removeTicker, clearTickers } = useComparisonStore();
    const [isExpanded, setIsExpanded] = useState(false);

    if (selectedTickers.length === 0) return null;

    const canCompare = selectedTickers.length >= 2;

    return (
        <div className={clsx(styles.trayContainer, { [styles.expanded]: isExpanded })}>
            {/* Header */}
            <div className={styles.collapsedHeader} onClick={() => setIsExpanded(!isExpanded)}>
                <div className={styles.info}>
                    <div className={styles.count}>{selectedTickers.length}</div>
                    <span className="text-white font-medium">Stocks selected for comparison</span>
                </div>
                <div className="flex items-center gap-3">
                    {!isExpanded && (
                        <Link
                            href="/stocks/compare"
                            className={clsx(styles.compareBtn, { [styles.disabled]: !canCompare })}
                            onClick={(e) => {
                                if (!canCompare) e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            Compare Now <ArrowRight size={16} />
                        </Link>
                    )}
                    {isExpanded ? <ChevronDown size={20} className="text-white/50" /> : <ChevronUp size={20} className="text-white/50" />}
                </div>
            </div>

            {/* Expanded List */}
            {isExpanded && (
                <>
                    <div className={styles.stockList}>
                        {selectedTickers.map(ticker => (
                            <div key={ticker} className={styles.miniCard}>
                                <div className={styles.stockInfo}>
                                    <span className={styles.ticker}>{ticker}</span>
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTicker(ticker);
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {selectedTickers.length < 4 && (
                            <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-3 text-white/20 text-xs text-center">
                                Add up to {4 - selectedTickers.length} more
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.clearBtn} onClick={clearTickers}>
                            <div className="flex items-center gap-2">
                                <Trash2 size={14} /> Clear All
                            </div>
                        </button>
                        <Link
                            href="/stocks/compare"
                            className={clsx(styles.compareBtn, { [styles.disabled]: !canCompare })}
                            onClick={(e) => {
                                if (!canCompare) e.preventDefault();
                            }}
                        >
                            <BarChart2 size={16} /> Compare {selectedTickers.length} Stocks
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};
