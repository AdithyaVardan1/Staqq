
import React from 'react';
import { SIPCalculator } from '@/components/tools/SIPCalculator';
import styles from './page.module.css';

export default function SIPCalculatorPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>SIP <span className="text-brand">Calculator</span></h1>
                    <p className={styles.subtitle}>Calculate the future value of your monthly investments.</p>
                </div>

                <SIPCalculator />
            </div>
        </main>
    );
}
