import { useEffect } from 'react';
import { useStream } from '@/context/StreamContext';

/**
 * Hook for fetching and subscribing to live market data from our Unified Stream.
 */
export function useLiveMarketData(ticker: string, initialPrice: number) {
    const { subscribe, unsubscribe, getMarketData, status } = useStream();

    useEffect(() => {
        if (ticker) {
            subscribe(ticker);
            return () => unsubscribe(ticker);
        }
    }, [ticker, subscribe, unsubscribe]);

    const liveData = getMarketData(ticker);

    return {
        price: liveData?.price !== undefined ? liveData.price : initialPrice,
        change: liveData?.change,
        changePercent: liveData?.changePercent,
        status
    };
}
