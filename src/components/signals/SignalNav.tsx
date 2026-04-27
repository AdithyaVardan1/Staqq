'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Users, Building2 } from 'lucide-react';
import styles from './SignalNav.module.css';

const TABS = [
    { href: '/signals', label: 'Market Feed', icon: Activity, exact: true },
    { href: '/signals/fii-dii', label: 'FII / DII', icon: BarChart3 },
    { href: '/signals/insider-trades', label: 'Insider Trades', icon: Users },
    { href: '/signals/bulk-deals', label: 'Bulk Deals', icon: Building2 },
];

export function SignalNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            {TABS.map(tab => {
                const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`${styles.tab} ${active ? styles.active : ''}`}
                    >
                        {active && (
                            <motion.div
                                layoutId="activeSignalTab"
                                className={styles.activeBg}
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                        )}
                        <Icon size={15} className={styles.tabIcon} />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
