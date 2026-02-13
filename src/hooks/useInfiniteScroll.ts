
import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions<T> {
    fetchData: (offset: number) => Promise<{ items: T[]; hasMore: boolean; total: number; nextOffset?: number }>;
    initialOffset?: number;
    limit?: number;
    maxAutoLoads?: number;
    dependencies?: any[];
}

export function useInfiniteScroll<T>({
    fetchData,
    initialOffset = 0,
    limit = 10,
    maxAutoLoads = 5,
    dependencies = []
}: UseInfiniteScrollOptions<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [offset, setOffset] = useState(initialOffset);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [autoLoadCount, setAutoLoadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { ref, inView } = useInView({
        threshold: 0.1,
    });

    const loadMore = useCallback(async (isInitial = false) => {
        if (isLoading || (!hasMore && !isInitial)) return;

        setIsLoading(true);
        setError(null);

        try {
            const currentOffset = isInitial ? initialOffset : offset;
            const response = await fetchData(currentOffset);

            setItems(prev => {
                if (isInitial) return response.items;

                // Deduplicate by ticker/symbol if they exist
                const existingIds = new Set(prev.map((item: any) => item.ticker || item.symbol || JSON.stringify(item)));
                const newItems = response.items.filter((item: any) => {
                    const id = item.ticker || item.symbol || JSON.stringify(item);
                    return !existingIds.has(id);
                });

                return [...prev, ...newItems];
            });
            setHasMore(response.hasMore);
            setTotal(response.total);
            setOffset(response.nextOffset ?? (currentOffset + limit));

            if (!isInitial) {
                setAutoLoadCount(prev => prev + 1);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, offset, fetchData, initialOffset, limit]);

    // Reset and initial load on dependency change
    useEffect(() => {
        setItems([]);
        setOffset(initialOffset);
        setHasMore(true);
        setAutoLoadCount(0);
        loadMore(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Auto load on scroll
    useEffect(() => {
        if (inView && hasMore && !isLoading && autoLoadCount < maxAutoLoads) {
            loadMore();
        }
    }, [inView, hasMore, isLoading, autoLoadCount, maxAutoLoads, loadMore]);

    const reset = useCallback(() => {
        setItems([]);
        setOffset(initialOffset);
        setHasMore(true);
        setAutoLoadCount(0);
        loadMore(true);
    }, [initialOffset, loadMore]);

    return {
        items,
        isLoading,
        hasMore,
        total,
        error,
        autoLoadCount,
        maxAutoLoads,
        loadMore,
        reset,
        intersectionRef: ref,
        showLoadMoreButton: hasMore && !isLoading && autoLoadCount >= maxAutoLoads
    };
}
