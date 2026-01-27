
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import styles from './IPOCard.module.css';

interface IPOCardProps {
    slug: string;
    name: string;
    priceBand: string;
    openDate: string;
    closeDate: string;
    gmp?: string;
    gmpPercent?: number;
    subscription?: number;
    status: 'Live' | 'Upcoming' | 'Closed';
}

export const IPOCard: React.FC<IPOCardProps> = ({
    slug,
    name,
    priceBand,
    openDate,
    closeDate,
    gmp,
    gmpPercent,
    subscription,
    status,
}) => {
    const isLive = status === 'Live';

    // GMP Color Logic
    const gmpVariant = gmpPercent && gmpPercent > 20 ? 'success' : gmpPercent && gmpPercent > 0 ? 'success' : 'neutral';

    // Status Badge Logic
    const statusVariant = isLive ? 'brand' : status === 'Upcoming' ? 'neutral' : 'outline';

    return (
        <Card hoverEffect className={styles.container}>
            <Link href={`/ipo/${slug}`} className={styles.link}>
                <div className={styles.header}>
                    <div className={styles.companyInfo}>
                        <div className={styles.logoPlaceholder}>{name.charAt(0)}</div>
                        <div>
                            <h3 className={styles.name}>{name}</h3>
                            <p className={styles.dates}>
                                {openDate} - {closeDate}
                            </p>
                        </div>
                    </div>
                    <Badge variant={statusVariant} size="sm">
                        {isLive && <span className={styles.liveDot} />}
                        {status}
                    </Badge>
                </div>

                <div className={styles.body}>
                    <div className={styles.priceSection}>
                        <span className={styles.label}>Price Band</span>
                        <span className={styles.value}>{priceBand}</span>
                    </div>

                    <div className={styles.gmpSection}>
                        <span className={styles.label}>GMP</span>
                        <div className={styles.gmpValue}>
                            <TrendingUp size={14} className={styles[gmpVariant]} />
                            <span className={styles[gmpVariant]}>{gmp} ({gmpPercent}%)</span>
                        </div>
                    </div>
                </div>

                {subscription && (
                    <div className={styles.subscription}>
                        <div className={styles.subHeader}>
                            <span className={styles.label}>Subscription</span>
                            <span className={styles.subValue}>{subscription}x</span>
                        </div>
                        <ProgressBar progress={Math.min(subscription * 10, 100)} variant={isLive ? 'brand' : 'neutral'} />
                    </div>
                )}

                <div className={styles.footer}>
                    <Button variant="secondary" size="sm" fullWidth>
                        View Details <ArrowUpRight size={16} />
                    </Button>
                </div>
            </Link>
        </Card>
    );
};
