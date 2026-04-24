'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Wallet, Shield, Rocket } from 'lucide-react';
import styles from './CryptoNav.module.css';

const TABS = [
    { href: '/crypto/signals', label: 'Signals', icon: Zap },
    { href: '/crypto/wallets', label: 'Wallets', icon: Wallet },
    { href: '/crypto/scanner', label: 'Scanner', icon: Shield },
    { href: '/crypto/new-tokens', label: 'New Launches', icon: Rocket },
];

export function CryptoNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            {TABS.map(tab => {
                const active = pathname.startsWith(tab.href);
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
