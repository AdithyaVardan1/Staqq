
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './SIPCalculator.module.css';

export const SIPCalculator = () => {
    // State
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    // Results
    const [investedAmount, setInvestedAmount] = useState(0);
    const [wealthGained, setWealthGained] = useState(0);
    const [totalValue, setTotalValue] = useState(0);

    // Calculation Logic
    useEffect(() => {
        const i = rate / 12 / 100;
        const n = years * 12;

        // SIP Formula: P × ({[1 + i]^n - 1} / i) × (1 + i)
        const M = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const P_total = monthlyInvestment * n;

        setInvestedAmount(Math.round(P_total));
        setTotalValue(Math.round(M));
        setWealthGained(Math.round(M - P_total));
    }, [monthlyInvestment, rate, years]);

    // Format Currency
    const formatInr = (num: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputsSection}>
                {/* Monthly Investment */}
                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Monthly Investment</label>
                        <div className={styles.valueDisplay}>₹{monthlyInvestment.toLocaleString()}</div>
                    </div>
                    <input
                        type="range"
                        min="500"
                        max="100000"
                        step="500"
                        value={monthlyInvestment}
                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>

                {/* Return Rate */}
                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Expected Return (p.a)</label>
                        <div className={styles.valueDisplay}>{rate}%</div>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="0.5"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>

                {/* Time Period */}
                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Time Period</label>
                        <div className={styles.valueDisplay}>{years} Years</div>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>
            </div>

            <div className={styles.resultsSection}>
                <Card className={styles.resultCard}>
                    <div className={styles.resultRow}>
                        <span>Invested Amount</span>
                        <span className={styles.investedVal}>{formatInr(investedAmount)}</span>
                    </div>
                    <div className={styles.resultRow}>
                        <span>Est. Returns</span>
                        <span className={styles.gainedVal}>+{formatInr(wealthGained)}</span>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={`${styles.resultRow} ${styles.totalRow}`}>
                        <span>Total Value</span>
                        <span className={styles.totalVal}>{formatInr(totalValue)}</span>
                    </div>

                    <div className={styles.actionBtn}>
                        <Button variant="primary" fullWidth>Invest Now</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
