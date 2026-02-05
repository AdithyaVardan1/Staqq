
'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './StockLogo.module.css';

interface StockLogoProps {
    ticker: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
    ticker,
    name,
    size = 'md',
    className
}) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_ID;

    // Brandfetch is a top-tier logo provider
    const upperTicker = ticker?.trim()?.toUpperCase();

    // Construct URL only if ticker exists
    const logoUrl = upperTicker
        ? `https://cdn.brandfetch.io/ticker/${upperTicker}?c=${clientId}`
        : '';

    return (
        <div
            className={clsx(
                styles.container,
                styles[size],
                className,
                status === 'success' && styles.hasLogo
            )}
            suppressHydrationWarning
            title={name}
        >
            {status !== 'error' && (
                <img
                    src={logoUrl}
                    alt={name}
                    className={clsx(styles.logo, status !== 'success' && styles.hidden)}
                    onLoad={() => setStatus('success')}
                    onError={() => setStatus('error')}
                />
            )}

            {status !== 'success' && (
                <div className={styles.fallback}>
                    {name.charAt(0)}
                </div>
            )}
        </div>
    );
};
