
import React from 'react';
import { Card } from '@/components/ui/Card';
import styles from './StockCardSkeleton.module.css';

export const StockCardSkeleton: React.FC = () => {
    return (
        <Card className={styles.container}>
            <div className={styles.shimmer}>
                <div className={styles.header}>
                    <div className={styles.logoCircle}></div>
                    <div className={styles.tickerInfo}>
                        <div className={styles.tickerLine}></div>
                        <div className={styles.nameLine}></div>
                    </div>
                </div>

                <div className={styles.priceRow}>
                    <div className={styles.priceSection}>
                        <div className={styles.priceLine}></div>
                        <div className={styles.changeLine}></div>
                    </div>
                    <div className={styles.chartPlaceholder}></div>
                </div>

                <div className={styles.metrics}>
                    <div className={styles.metric}>
                        <div className={styles.metricLabelLine}></div>
                        <div className={styles.metricValueLine}></div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabelLine}></div>
                        <div className={styles.metricValueLine}></div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabelLine}></div>
                        <div className={styles.metricValueLine}></div>
                    </div>
                </div>

                <div className={styles.buttonPlaceholder}></div>
            </div>
        </Card>
    );
};
