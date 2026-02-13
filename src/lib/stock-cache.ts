import { redis } from './redis';

class StockCache {
    private TTL = 600; // 10 minutes in seconds for Redis

    async get(key: string): Promise<any | null> {
        try {
            const data = await redis.get(`stock_cache:${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[StockCache] Get error:', e);
            return null;
        }
    }

    async set(key: string, data: any): Promise<void> {
        try {
            await redis.set(`stock_cache:${key}`, JSON.stringify(data), this.TTL);
        } catch (e) {
            console.error('[StockCache] Set error:', e);
        }
    }

    async clear(): Promise<void> {
        // Warning: This is a demo implementation, clearing everything is risky in shared redis
        // In a real app, we'd use a pattern or specific keys.
        const client = redis.getClient();
        if (client) {
            const keys = await client.keys('stock_cache:*');
            if (keys.length > 0) await client.del(...keys);
        }
    }
}

// Global instance (persists during dev server session)
export const stockCache = new StockCache();
