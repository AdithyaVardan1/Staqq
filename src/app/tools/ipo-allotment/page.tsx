
import React from 'react';
import { IPOAllotmentCalculator } from '@/components/tools/IPOAllotmentCalculator';
import styles from './page.module.css';

export default function IPOAllotmentPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>IPO <span className="text-brand">Probabilitometer</span></h1>
                    <p className={styles.subtitle}>What are your chances of getting that hot allotment?</p>
                </div>

                <IPOAllotmentCalculator />
            </div>
        </main>
    );
}
