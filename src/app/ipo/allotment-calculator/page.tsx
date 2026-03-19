'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import { estimateAllotmentProbability } from '@/lib/ipoAnalytics';
import styles from './page.module.css';

export default function AllotmentCalculatorPage() {
    const [subscriptionX, setSubscriptionX] = useState('');
    const [category, setCategory] = useState<'IPO' | 'SME'>('IPO');
    const [applications, setApplications] = useState('1');
    const [lotValue, setLotValue] = useState('');

    const subNum = parseFloat(subscriptionX) || 0;
    const appNum = parseInt(applications) || 1;

    const result = useMemo(() => {
        if (subNum <= 0) return null;
        return estimateAllotmentProbability(subNum, category);
    }, [subNum, category]);

    // Multi-application probability: 1 - (1 - p)^n
    const multiAppProb = useMemo(() => {
        if (!result) return null;
        const singleProb = result.probability / 100;
        const combinedProb = 1 - Math.pow(1 - singleProb, appNum);
        return Math.round(combinedProb * 100);
    }, [result, appNum]);

    const lotValueNum = parseFloat(lotValue) || 0;
    const totalInvestment = lotValueNum * appNum;

    return (
        <main className={styles.main}>
            <div className="container">
                <Link href="/ipo" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to IPO Hub
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Allotment <span className="text-brand">Calculator</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Estimate your IPO allotment probability based on subscription data.
                    </p>
                </div>

                <div className={styles.layout}>
                    {/* Input Section */}
                    <Card className={styles.inputCard}>
                        <h2 className={styles.cardTitle}>
                            <Calculator size={20} className="text-brand" />
                            Enter IPO Details
                        </h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>IPO Category</label>
                            <div className={styles.toggleGroup}>
                                <button
                                    className={`${styles.toggleBtn} ${category === 'IPO' ? styles.active : ''}`}
                                    onClick={() => setCategory('IPO')}
                                >
                                    Mainboard
                                </button>
                                <button
                                    className={`${styles.toggleBtn} ${category === 'SME' ? styles.active : ''}`}
                                    onClick={() => setCategory('SME')}
                                >
                                    SME
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Subscription Multiple (x)</label>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="e.g. 15.5"
                                value={subscriptionX}
                                onChange={e => setSubscriptionX(e.target.value)}
                                min="0"
                                step="0.1"
                            />
                            <span className={styles.hint}>Enter the Retail (RII) subscription multiple</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Number of Applications</label>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="1"
                                value={applications}
                                onChange={e => setApplications(e.target.value)}
                                min="1"
                                max="50"
                            />
                            <span className={styles.hint}>Using different PAN/demat accounts</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Lot Value (optional)</label>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="e.g. 15000"
                                value={lotValue}
                                onChange={e => setLotValue(e.target.value)}
                                min="0"
                            />
                            <span className={styles.hint}>Price per lot = Issue Price × Lot Size</span>
                        </div>
                    </Card>

                    {/* Result Section */}
                    <div className={styles.resultSection}>
                        {result ? (
                            <>
                                <Card className={styles.resultCard}>
                                    <div className={styles.resultLabel}>Single Application</div>
                                    <div className={styles.resultValue} style={{ color: result.color }}>
                                        {result.probability}%
                                    </div>
                                    <div className={styles.resultTag} style={{ color: result.color, borderColor: `${result.color}40` }}>
                                        {result.label}
                                    </div>
                                </Card>

                                {appNum > 1 && multiAppProb !== null && (
                                    <Card className={styles.resultCard}>
                                        <div className={styles.resultLabel}>{appNum} Applications Combined</div>
                                        <div className={styles.resultValue} style={{ color: multiAppProb >= 50 ? '#22c55e' : multiAppProb >= 15 ? '#f59e0b' : '#ef4444' }}>
                                            {multiAppProb}%
                                        </div>
                                        <div className={styles.resultSub}>
                                            At least 1 allotment out of {appNum}
                                        </div>
                                    </Card>
                                )}

                                {totalInvestment > 0 && (
                                    <Card className={styles.resultCard}>
                                        <div className={styles.resultLabel}>Total Blocked Amount</div>
                                        <div className={styles.resultValue} style={{ fontSize: '1.6rem' }}>
                                            ₹{totalInvestment.toLocaleString('en-IN')}
                                        </div>
                                        <div className={styles.resultSub}>
                                            {appNum} application{appNum > 1 ? 's' : ''} × ₹{lotValueNum.toLocaleString('en-IN')}
                                        </div>
                                    </Card>
                                )}

                                <div className={styles.disclaimer}>
                                    <Info size={14} />
                                    <span>
                                        Probability is estimated based on subscription multiples and historical patterns. Actual allotment depends on registrar lottery and SEBI guidelines.
                                    </span>
                                </div>
                            </>
                        ) : (
                            <Card className={styles.emptyResult}>
                                <Calculator size={40} style={{ color: '#444' }} />
                                <p>Enter the subscription multiple to see your estimated allotment probability.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
