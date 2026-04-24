'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, Users, Building2 } from 'lucide-react';
import styles from './SignalNav.module.css';

const TABS = [
    { href: '/signals', label: 'Social', icon: Activity, exact: true },
    { href: '/signals/fii-dii', label: 'FII / DII', icon: BarChart3 },
    { href: '/signals/bulk-deals', label: 'Bulk Deals', icon: Building2 },
    { href: '/signals/insider-trades', label: 'Insider Trades', icon: Users },
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
                        <Icon size={15} />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
