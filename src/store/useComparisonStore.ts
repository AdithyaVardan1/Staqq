import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonState {
    selectedTickers: string[];
    addTicker: (ticker: string) => void;
    removeTicker: (ticker: string) => void;
    clearTickers: () => void;
    isComparing: boolean;
    setIsComparing: (val: boolean) => void;
    triggerSearch: boolean;
    setTriggerSearch: (val: boolean) => void;
}

export const useComparisonStore = create<ComparisonState>()(
    persist(
        (set) => ({
            selectedTickers: [],
            addTicker: (ticker: string) =>
                set((state) => {
                    if (state.selectedTickers.includes(ticker)) return state;
                    if (state.selectedTickers.length >= 4) return state; // Limit 4
                    return { selectedTickers: [...state.selectedTickers, ticker] };
                }),
            removeTicker: (ticker: string) =>
                set((state) => ({
                    selectedTickers: state.selectedTickers.filter((t) => t !== ticker)
                })),
            clearTickers: () => set({ selectedTickers: [] }),
            isComparing: false,
            setIsComparing: (val) => set({ isComparing: val }),
            triggerSearch: false,
            setTriggerSearch: (val) => set({ triggerSearch: val }),
        }),
        {
            name: 'stock-comparison-storage',
        }
    )
);
