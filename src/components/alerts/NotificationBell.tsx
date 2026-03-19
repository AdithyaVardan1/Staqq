'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
    isLoggedIn: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isLoggedIn }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, fetch: fetchNotifs, markAllRead } = useNotificationsStore();

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isLoggedIn, fetchNotifs]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!isLoggedIn) return null;

    const handleToggle = () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen && unreadCount > 0) markAllRead();
    };

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div ref={ref} className={styles.wrap}>
            <button
                className={styles.bellBtn}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                onClick={handleToggle}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownTitle}>Spike Alerts</span>
                        <Link href="/alerts" className={styles.manageLink} onClick={() => setOpen(false)}>
                            Manage
                        </Link>
                    </div>

                    {notifications.length === 0 ? (
                        <div className={styles.empty}>
                            No alerts yet. Subscribe to tickers on any stock page to get notified when they spike on Reddit.
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {notifications.slice(0, 8).map(n => (
                                <div key={n.id} className={`${styles.item} ${!n.read ? styles.unread : ''}`}>
                                    <div className={styles.itemTicker}>${n.alert.ticker}</div>
                                    <div className={styles.itemMsg}>
                                        {n.alert.spike_mult}x spike &middot; {n.alert.mention_count} mentions in 15 min
                                    </div>
                                    <div className={styles.itemMeta}>
                                        {formatTime(n.alert.detected_at)}
                                        {n.alert.top_post_url && (
                                            <>
                                                {' '}&middot;{' '}
                                                <a
                                                    href={n.alert.top_post_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.itemLink}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    View post
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {notifications.length > 8 && (
                        <div className={styles.dropdownFooter}>
                            <Link href="/alerts" onClick={() => setOpen(false)} className={styles.viewAll}>
                                View all alerts
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
