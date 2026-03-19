import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WATCHLIST_STORAGE_KEY } from '../lib/config';

interface WatchlistState {
    tickers: string[];
    loading: boolean;
    load: () => Promise<void>;
    add: (ticker: string) => Promise<void>;
    remove: (ticker: string) => Promise<void>;
    has: (ticker: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
    tickers: [],
    loading: true,

    load: async () => {
        try {
            const raw = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
            const tickers = raw ? JSON.parse(raw) : [];
            set({ tickers, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    add: async (ticker) => {
        const updated = [...new Set([...get().tickers, ticker.toUpperCase()])];
        set({ tickers: updated });
        await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    },

    remove: async (ticker) => {
        const updated = get().tickers.filter(t => t !== ticker.toUpperCase());
        set({ tickers: updated });
        await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    },

    has: (ticker) => get().tickers.includes(ticker.toUpperCase()),
}));
