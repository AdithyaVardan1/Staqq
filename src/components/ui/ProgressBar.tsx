
'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
    progress: number; // 0 to 100
    color?: string; // CSS color string (optional override)
    variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
    showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    variant = 'brand',
    color,
    className,
    showLabel = false,
}) => {
    const cappedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.track}>
                <motion.div
                    className={clsx(styles.bar, styles[variant])}
                    style={color ? { backgroundColor: color } : undefined}
                    initial={{ width: 0 }}
                    animate={{ width: `${cappedProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
            {showLabel && (
                <span className={styles.label}>{cappedProgress}%</span>
            )}
        </div>
    );
};
