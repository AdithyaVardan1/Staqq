/**
 * Hook for live market data.
 * Returns initial values as-is (streaming removed during cleanup).
 * TODO: Re-implement with direct WebSocket in Phase 2.
 */
export function useLiveMarketData(ticker: string, initialPrice?: number, initialChange?: number, initialChangePercent?: number) {
    return {
        price: initialPrice,
        change: initialChange,
        changePercent: initialChangePercent,
        status: 'idle' as string
    };
}
