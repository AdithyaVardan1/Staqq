import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Module-level in-memory store — survives across warm serverless invocations.
// Used as a fast L1 cache so Redis failures don't break the app.
const memStore = new Map<string, { value: string; expiresAt: number }>();

function memGet(key: string): string | null {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
    return entry.value;
}

function memSet(key: string, value: string, ttlSeconds?: number) {
    memStore.set(key, {
        value,
        expiresAt: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : 24 * 60 * 60 * 1000),
    });
}

function memDel(key: string) { memStore.delete(key); }

class RedisService {
    private client: Redis | null = null;
    private lastConnectAttempt = 0;
    private readonly RECONNECT_COOLDOWN = 5000; // don't spam connection attempts

    getClient(): Redis | null {
        // If the client is in 'end' state, drop it so we create a fresh one
        if (this.client && (this.client.status === 'end' || this.client.status === 'close')) {
            this.client = null;
        }

        if (!this.client) {
            const now = Date.now();
            if (now - this.lastConnectAttempt < this.RECONNECT_COOLDOWN) {
                return null; // cooldown — don't spam connection attempts
            }
            this.lastConnectAttempt = now;

            try {
                this.client = new Redis(redisUrl, {
                    // Give each command up to 3 retries — important for the first
                    // command after a reconnect which may still be connecting
                    maxRetriesPerRequest: 3,
                    retryStrategy: (times) => {
                        if (times > 3) return null; // give up after 3 reconnect attempts
                        return Math.min(times * 200, 1000);
                    },
                    connectTimeout: 4000,
                    commandTimeout: 3000,
                    // Reconnect on any socket error, not just READONLY
                    reconnectOnError: () => true,
                    enableReadyCheck: false, // don't wait for PING before first command
                    lazyConnect: false,
                });

                this.client.on('error', (err) => {
                    // Suppress noisy logs — just track it happened
                    if (!err.message.includes('Connection is closed') &&
                        !err.message.includes('ECONNREFUSED')) {
                        console.error('[Redis] Error:', err.message);
                    }
                });
            } catch {
                return null;
            }
        }

        return this.client;
    }

    private async call<T>(fn: (client: Redis) => Promise<T>): Promise<T | null> {
        const client = this.getClient();
        if (!client) return null;
        try {
            return await fn(client);
        } catch {
            // Don't log every Redis failure — too noisy in prod
            return null;
        }
    }

    // ── Public API — all methods fall back to in-memory when Redis is down ──

    async get(key: string): Promise<string | null> {
        // L1: in-memory
        const mem = memGet(key);
        if (mem !== null) return mem;
        // L2: Redis
        const val = await this.call(c => c.get(key));
        if (val) memSet(key, val); // warm L1
        return val;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        memSet(key, value, ttlSeconds); // always update L1
        await this.call(async (c) => {
            if (ttlSeconds) await c.set(key, value, 'EX', ttlSeconds);
            else await c.set(key, value);
        });
    }

    async del(key: string): Promise<void> {
        memDel(key);
        await this.call(c => c.del(key));
    }

    async lpush(key: string, value: string, limit: number = 10) {
        return this.call(async (c) => {
            await c.lrem(key, 0, value);
            await c.lpush(key, value);
            await c.ltrim(key, 0, limit - 1);
        });
    }

    async lrange(key: string, start: number, stop: number) {
        return (await this.call(c => c.lrange(key, start, stop))) ?? [];
    }

    async zincrby(key: string, increment: number, member: string) {
        return this.call(c => c.zincrby(key, increment, member));
    }

    async zrevrange(key: string, start: number, stop: number) {
        return (await this.call(c => c.zrevrange(key, start, stop))) ?? [];
    }

    async zadd(key: string, score: number, member: string) {
        return this.call(c => c.zadd(key, score, member));
    }

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

    async incr(key: string, ttlSeconds?: number): Promise<number> {
        const res = await this.call(async (c) => {
            const val = await c.incr(key);
            if (ttlSeconds && val === 1) await c.expire(key, ttlSeconds);
            return val;
        });
        return res ?? 0;
    }
}

export const redis = new RedisService();
