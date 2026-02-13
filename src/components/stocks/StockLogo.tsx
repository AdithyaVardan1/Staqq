
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
    const [srcIndex, setSrcIndex] = useState(0);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_ID;

    // Normalize ticker
    const uppercaseTicker = ticker?.trim()?.toUpperCase() || '';
    const baseTicker = uppercaseTicker.split('.')[0];
    const nsTicker = baseTicker + '.NS';

    // Reset state on ticker change
    React.useEffect(() => {
        setSrcIndex(0);
        setStatus('loading');
    }, [ticker]);

    const sources = [
        // Source 1: Upstox (Highly reliable for Indian stocks)
        `https://assets.upstox.com/content/assets/images/logos/${baseTicker}.png`,
        // Source 2: TradingView NSE prefix
        `https://s3-symbol-logo.tradingview.com/nse-${baseTicker.toLowerCase()}--big.svg`,
        // Source 3: Brandfetch with .NS (Often works for Indian stocks)
        `https://cdn.brandfetch.io/ticker/${nsTicker}?c=${clientId}`,
        // Source 4: Finology
        `https://ticker.finology.in/logos/stocks/${baseTicker}.png`,
        // Source 5: Brandfetch Base
        `https://cdn.brandfetch.io/ticker/${baseTicker}?c=${clientId}`,
        // Source 6: TradingView fallback
        `https://s3-symbol-logo.tradingview.com/${baseTicker}--big.svg`
    ];

    const currentSrc = sources[srcIndex];

    const handleError = () => {
        if (srcIndex < sources.length - 1) {
            setSrcIndex(prev => prev + 1);
            setStatus('loading');
        } else {
            console.warn(`[StockLogo] All sources failed for ${uppercaseTicker}`);
            setStatus('error');
        }
    };

    const handleLoad = () => {
        setStatus('success');
    };

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
            {/* The Fallback is ALWAYS in the background while loading or on error */}
            {status !== 'success' && (
                <div className={styles.fallback}>
                    {name.charAt(0)}
                </div>
            )}

            {status !== 'error' && uppercaseTicker && (
                <img
                    key={currentSrc} // Force re-render on src change
                    src={currentSrc}
                    alt={name}
                    className={clsx(styles.logo, status !== 'success' && styles.hidden)}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
};
