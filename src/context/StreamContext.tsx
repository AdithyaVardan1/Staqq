'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';

interface TickData {
    ticker: string;
    price: number;
    change?: number;
    changePercent?: number;
    timestamp?: string;
}

interface StreamContextValue {
    subscribe: (ticker: string) => Promise<void>;
    unsubscribe: (ticker: string) => void;
    getPrice: (ticker: string) => number | null;
    getMarketData: (ticker: string) => TickData | null;
    status: 'connecting' | 'connected' | 'error' | 'idle';
}

const StreamContext = createContext<StreamContextValue | undefined>(undefined);

export const StreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [marketData, setMarketData] = useState<Record<string, TickData>>({});
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');
    const subscribersRef = useRef<Set<string>>(new Set());
    const eventSourceRef = useRef<EventSource | null>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        const activeTickers = Array.from(subscribersRef.current);
        if (activeTickers.length === 0) {
            setStatus('idle');
            return;
        }

        setStatus('connecting');
        const tickersParam = activeTickers.join(',');
        const es = new EventSource(`/api/stocks/stream?tickers=${tickersParam}`);
        eventSourceRef.current = es;

        es.onopen = () => setStatus('connected');

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === 'connected') return;

                if (data.ticker && data.price) {
                    setMarketData(prev => {
                        // Only update if price actually changed to reduce rerenders
                        if (prev[data.ticker]?.price === data.price) return prev;
                        return {
                            ...prev,
                            [data.ticker]: {
                                ...prev[data.ticker],
                                ticker: data.ticker,
                                price: data.price,
                                timestamp: data.timestamp
                            }
                        };
                    });
                }
            } catch (e) {
                console.error('[StreamContext] Parse error:', e);
            }
        };

        es.onerror = () => {
            setStatus('error');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            if (!reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    updateStream();
                }, 5000);
            }
        };
    }, []);

    const subscribe = useCallback(async (ticker: string) => {
        if (!subscribersRef.current.has(ticker)) {
            console.log(`[StreamContext] Subscribing to ${ticker}`);
            subscribersRef.current.add(ticker);

            // Fetch initial real price immediately so user doesn't see mock data
            try {
                const res = await fetch(`/api/stocks/price?ticker=${ticker}`);
                const data = await res.json();
                if (data.price) {
                    console.log(`[StreamContext] Initial data for ${ticker}:`, data);
                    setMarketData(prev => ({
                        ...prev,
                        [ticker]: {
                            ticker,
                            price: data.price,
                            change: data.change,
                            changePercent: data.changePercent
                        }
                    }));
                }
            } catch (e) {
                console.error(`[StreamContext] Failed to fetch initial price for ${ticker}:`, e);
            }

            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = setTimeout(updateStream, 500);
        }
    }, [updateStream]);

    const unsubscribe = useCallback((ticker: string) => {
        if (subscribersRef.current.has(ticker)) {
            console.log(`[StreamContext] Unsubscribing from ${ticker}`);
            subscribersRef.current.delete(ticker);

            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = setTimeout(updateStream, 500);
        }
    }, [updateStream]);

    const getPrice = useCallback((ticker: string) => marketData[ticker]?.price || null, [marketData]);
    const getMarketData = useCallback((ticker: string) => marketData[ticker] || null, [marketData]);

    const contextValue = useMemo(() => ({
        subscribe,
        unsubscribe,
        getPrice,
        getMarketData,
        status
    }), [subscribe, unsubscribe, getPrice, getMarketData, status]);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, []);

    return (
        <StreamContext.Provider value={contextValue}>
            {children}
        </StreamContext.Provider>
    );
};

export const useStream = () => {
    const context = useContext(StreamContext);
    if (!context) throw new Error('useStream must be used within a StreamProvider');
    return context;
};
