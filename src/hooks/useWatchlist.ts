import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'staqq_watchlist';

export const useWatchlist = () => {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem(WATCHLIST_KEY);
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse watchlist', e);
            }
        }
        setIsLoading(false);
    }, []);

    const addToWatchlist = (symbol: string) => {
        const updated = [...new Set([...watchlist, symbol])];
        setWatchlist(updated);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    };

    const removeFromWatchlist = (symbol: string) => {
        const updated = watchlist.filter(s => s !== symbol);
        setWatchlist(updated);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    };

    const isInWatchlist = (symbol: string) => {
        return watchlist.includes(symbol);
    };

    return {
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        isLoading
    };
};
