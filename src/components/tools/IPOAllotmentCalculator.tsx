
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './IPOAllotment.module.css';

export const IPOAllotmentCalculator = () => {
    // State
    const [category, setCategory] = useState<'RETAIL' | 'HNI'>('RETAIL');
    const [sharePrice, setSharePrice] = useState(100);
    const [lotSize, setLotSize] = useState(10);
    const [applications, setApplications] = useState(5);
    const [subscriptionRate, setSubscriptionRate] = useState(50); // 50x subscribed

    // Results
    const [probability, setProbability] = useState(0);
    const [allotmentStatus, setAllotmentStatus] = useState<string>('Low Chance');

    useEffect(() => {
        // Logic:
        // If subscription <= 1, Probability = 100%
        // If subscription > 1, Probability = (1 / Subscription) * Applications
        // Note: In reality, Retail is one lot per PAN, so 'Applications' implies multiple PANs (Family).
        // For HNI, it's pro-rata, but simplified here for "Luck Probability".

        let prob = 0;
        if (subscriptionRate <= 1) {
            prob = 100;
        } else {
            prob = (1 / subscriptionRate) * applications * 100;
            // Cap at 100
            if (prob > 100) prob = 100;
        }

        setProbability(Number(prob.toFixed(2)));

        if (prob >= 90) setAllotmentStatus('Guaranteed');
        else if (prob >= 50) setAllotmentStatus('High Chance');
        else if (prob >= 20) setAllotmentStatus('Moderate Luck');
        else if (prob >= 5) setAllotmentStatus('Low Chance');
        else setAllotmentStatus('Lottery Ticket');

    }, [subscriptionRate, applications, category]);


    return (
        <div className={styles.container}>
            <div className={styles.inputsSection}>

                {/* Category Selection */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${category === 'RETAIL' ? styles.activeTab : ''}`}
                        onClick={() => setCategory('RETAIL')}
                    >
                        Retail (RII)
                    </button>
                    <button
                        className={`${styles.tab} ${category === 'HNI' ? styles.activeTab : ''}`}
                        onClick={() => setCategory('HNI')}
                    >
                        HNI (NII)
                    </button>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Subscription Rate (Times)</label>
                        <div className={styles.valueDisplay}>{subscriptionRate}x</div>
                    </div>
                    <input
                        type="range" min="1" max="200" step="1"
                        value={subscriptionRate}
                        onChange={(e) => setSubscriptionRate(Number(e.target.value))}
                        className={styles.slider}
                    />
                    <p className={styles.helperText}>How many times is the IPO oversubscribed?</p>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Applications Applied (Family PANs)</label>
                        <div className={styles.valueDisplay}>{applications}</div>
                    </div>
                    <input
                        type="range" min="1" max="10" step="1"
                        value={applications}
                        onChange={(e) => setApplications(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>

            </div>

            <div className={styles.resultsSection}>
                <Card className={styles.resultCard}>
                    <h3 className={styles.cardTitle}>Your Allotment Probability</h3>

                    <div className={styles.circleChart}>
                        <div className={styles.percentage}>{probability}%</div>
                        <div className={styles.status}>{allotmentStatus}</div>
                    </div>

                    <div className={styles.feedback}>
                        {probability < 10 ?
                            "It's purely a lottery at this point. Good luck!" :
                            "You have a decent shot!"
                        }
                    </div>

                    <Button variant="primary" fullWidth className="mt-4">Track Live GMP</Button>
                </Card>
            </div>
        </div>
    );
};
