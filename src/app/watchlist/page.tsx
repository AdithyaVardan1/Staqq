
'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Trash2 } from 'lucide-react';
import styles from './page.module.css';

// Mock Data
const SAVED_ITEMS = [
    { id: 1, type: 'IPO', name: 'Zomato Ltd', price: '₹76', change: '+20%', status: 'Live' },
    { id: 2, type: 'STOCK', name: 'Tata Motors', price: '₹650', change: '+1.5%', status: 'Active' },
    { id: 3, type: 'IPO', name: 'Ola Electric', price: '₹120', change: 'Upcoming', status: 'Upcoming' },
];

export default function WatchlistPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Your <span className="text-brand">Watchlist</span></h1>
                    <p className={styles.subtitle}>Track your favorite IPOs and stocks in one place.</p>
                </div>

                <div className={styles.grid}>
                    {SAVED_ITEMS.length > 0 ? (
                        SAVED_ITEMS.map((item) => (
                            <Card key={item.id} className={styles.itemCard}>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemType}>{item.type}</span>
                                        <h3 className={styles.itemName}>{item.name}</h3>
                                        <div className={styles.itemMeta}>
                                            <span className={styles.itemPrice}>{item.price}</span>
                                            <span className={`${styles.itemChange} ${item.change.includes('+') ? styles.positive : ''}`}>
                                                {item.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <Link href={item.type === 'IPO' ? '/ipo' : '/stocks/screener'}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                        <button className={styles.deleteBtn} aria-label="Remove">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <TrendingUp size={48} className="text-brand mb-4" />
                            <h3>Your watchlist is empty</h3>
                            <p>Start exploring to add items here.</p>
                            <Link href="/ipo">
                                <Button variant="primary" className="mt-4">Explore IPOs</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
