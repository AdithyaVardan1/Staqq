'use client';

import React, { useState } from 'react';
import { useComparisonStore } from '@/store/useComparisonStore';
import { Button } from '@/components/ui/Button';
import { X, ArrowRight, BarChart2, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StockLogo } from './StockLogo';
import styles from './ComparisonTray.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const ComparisonTray = () => {
    const { selectedTickers, removeTicker, clearTickers } = useComparisonStore();
    const [isMinimized, setIsMinimized] = useState(false);
    const router = useRouter();

    if (selectedTickers.length === 0) return null;

    return (
        <motion.div
            className={styles.trayWrapper}
            drag
            dragMomentum={false}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        >
            <div className={clsx(styles.tray, isMinimized && styles.minimized)}>
                <div className={styles.header}>
                    <div className={styles.headerLhs}>
                        <GripVertical size={16} className={styles.dragHandle} />
                        <div className={styles.countBadge}>
                            <BarChart2 size={16} />
                            <span>{selectedTickers.length} / 4 Stocks</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.headerBtn} onClick={() => setIsMinimized(!isMinimized)}>
                            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {!isMinimized && (
                            <button className={styles.clearBtn} onClick={clearTickers}>
                                <Trash2 size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={styles.content}
                        >
                            <div className={styles.stockList}>
                                {selectedTickers.map(ticker => (
                                    <div key={ticker} className={styles.stockItem}>
                                        <StockLogo ticker={ticker} name={ticker} size="sm" />
                                        <span className={styles.tickerName}>{ticker}</span>
                                        <button className={styles.removeBtn} onClick={() => removeTicker(ticker)}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {selectedTickers.length < 4 && (
                                    <div className={styles.placeholder}>
                                        Add more...
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className={styles.compareButton}
                                    onClick={() => router.push('/stocks/compare')}
                                    disabled={selectedTickers.length < 2}
                                >
                                    Compare Now <ArrowRight size={14} />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
