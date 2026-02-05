
import React from 'react';
import { BrokerageCalculator } from '@/components/tools/BrokerageCalculator';
import styles from './page.module.css';

export default function BrokeragePage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>True <span className="text-brand">P&L</span></h1>
                    <p className={styles.subtitle}>See how much the government and broker really take.</p>
                </div>

                <BrokerageCalculator />
            </div>
        </main>
    );
}
