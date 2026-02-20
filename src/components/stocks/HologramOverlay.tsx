import React from 'react';
import { Card } from '@/components/ui/Card';
import styles from './HologramOverlay.module.css';

interface HologramOverlayProps {
    sector: string;
    industry: string;
    high52: number;
    low52: number;
    beta: number;
    divYield: number;
    website?: string;
}

export const HologramOverlay: React.FC<HologramOverlayProps> = ({
    sector,
    industry,
    high52,
    low52,
    beta,
    divYield,
    website
}) => {
    return (
        <div className={styles.overlayContainer}>
            <div className={styles.hologramContent}>
                <div className={styles.scanline}></div>
                <div className={styles.header}>
                    <span className={styles.badge}>HOLO-VIEW</span>
                </div>

                <div className={styles.grid}>
                    <div className={styles.item}>
                        <label>Sector</label>
                        <span>{sector}</span>
                    </div>
                    <div className={styles.item}>
                        <label>Industry</label>
                        <span>{industry}</span>
                    </div>
                    <div className={styles.item}>
                        <label>52W High</label>
                        <span className={styles.positive}>₹{high52?.toLocaleString()}</span>
                    </div>
                    <div className={styles.item}>
                        <label>52W Low</label>
                        <span className={styles.negative}>₹{low52?.toLocaleString()}</span>
                    </div>
                    <div className={styles.item}>
                        <label>Beta</label>
                        <span>{beta?.toFixed(2)}</span>
                    </div>
                    <div className={styles.item}>
                        <label>Div Yield</label>
                        <span>{(divYield * 100)?.toFixed(2)}%</span>
                    </div>
                </div>

                {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                        Visit Website
                    </a>
                )}
            </div>
        </div>
    );
};
