import React from 'react';
import { SignalNav } from '@/components/signals/SignalNav';
import styles from './layout.module.css';

export default function SignalsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout}>
            <div className={styles.heroGlowLime} aria-hidden="true" />
            <div className={styles.heroGlowViolet} aria-hidden="true" />

            <div className={styles.container}>
                <div className={styles.navWrapper}>
                    <SignalNav />
                </div>
                
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
