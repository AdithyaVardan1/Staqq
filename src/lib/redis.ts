import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
    private client: Redis | null = null;

    getClient() {
        // Reset client if connection is closed/ended so we can try reconnecting
        if (this.client && this.client.status === 'end') {
            this.client = null;
        }

        if (!this.client) {
            try {
                this.client = new Redis(redisUrl, {
                    maxRetriesPerRequest: 1, // Fail fast if down
                    retryStrategy: (times) => {
                        // Retry up to 5 times, then stop retrying for this session
                        if (times > 5) return null;
                        return Math.min(times * 200, 2000);
                    },
                    connectTimeout: 5000,
                    reconnectOnError: (err) => {
                        const targetError = 'READONLY';
                        if (err.message.includes(targetError)) return true;
                        return false;
                    }
                });

                this.client.on('error', (err) => {
                    console.error('[Redis] Connection error:', err.message);
                });

                this.client.on('connect', () => {
                    console.log('[Redis] Connected successfully');
                });
            } catch (error) {
                console.error('[Redis] Initialization failed:', error);
            }
        }
        return this.client;
    }

    private async call<T>(fn: (client: Redis) => Promise<T>): Promise<T | null> {
        const client = this.getClient();
        if (!client) return null;
        try {
            // Check if status is ready/connecting
            if (client.status === 'end') return null;
            return await fn(client);
        } catch (error: any) {
            console.error('[Redis] Operation failed:', error.message);
            return null;
        }
    }

    async get(key: string) {
        return this.call(c => c.get(key));
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        return this.call(async (c) => {
            if (ttlSeconds) {
                await c.set(key, value, 'EX', ttlSeconds);
            } else {
                await c.set(key, value);
            }
        });
    }

    async del(key: string) {
        return this.call(c => c.del(key));
    }

    // List helpers for Recent Searches
    async lpush(key: string, value: string, limit: number = 10) {
        return this.call(async (c) => {
            await c.lrem(key, 0, value);
            await c.lpush(key, value);
            await c.ltrim(key, 0, limit - 1);
        });
    }

    async lrange(key: string, start: number, stop: number) {
        return this.call(c => c.lrange(key, start, stop)) ?? [];
    }

    // Sorted Set helpers for Trending
    async zincrby(key: string, increment: number, member: string) {
        return this.call(c => c.zincrby(key, increment, member));
    }

    async zrevrange(key: string, start: number, stop: number) {
        const res = await this.call(c => c.zrevrange(key, start, stop));
        return res || [];
    }

    async zadd(key: string, score: number, member: string) {
        return this.call(c => c.zadd(key, score, member));
    }

    // HASH helpers for Session
    async hget(key: string, field: string) {
        return this.call(c => c.hget(key, field));
    }

    async hdel(key: string, field: string) {
        return this.call(c => c.hdel(key, field));
    }

    async hSetWithExpiry(key: string, field: string, value: string, ttlSeconds: number) {
        return this.call(async (c) => {
            const pipeline = c.pipeline();
            pipeline.hset(key, field, value);
            pipeline.expire(key, ttlSeconds);
            await pipeline.exec();
        });
    }

    // Counter helpers for Rate Limiting
    async incr(key: string, ttlSeconds?: number) {
        const res = await this.call(async (c) => {
            const val = await c.incr(key);
            if (ttlSeconds && val === 1) {
                await c.expire(key, ttlSeconds);
            }
            return val;
        });
        return res || 0;
    }
}

export const redis = new RedisService();
