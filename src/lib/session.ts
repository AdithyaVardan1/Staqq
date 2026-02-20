import { redis } from './redis';

const SESSION_TTL = 30 * 60; // 30 minutes inactivity timeout
const ACTIVE_USERS_KEY = 'global:active_users';

export class SessionManager {
    /**
     * Updates the "last active" timestamp for a user.
     * Uses a Sorted Set (ZSET) where score = timestamp.
     */
    async trackUserActivity(userId: string) {
        const now = Date.now();
        // Add/Update user in sorted set with current timestamp utilizing safe wrapper
        await redis.zadd(ACTIVE_USERS_KEY, now, userId);
    }

    /**
     * Returns the count of unique users active in the last N minutes.
     */
    async getActiveUserCount(minutes: number = 15): Promise<number> {
        const client = redis.getClient();
        if (!client) return 0;
        // zcount is read-only safe, but better to wrap if we strictly want no crashes.
        // For now, raw access for zcount is okay as it's less critical, 
        // OR we can add zcount to redis.ts. Let's stick to safe access pattern where possible.
        // Actually, let's just try/catch here to be ultra safe if we use raw client.
        try {
            const now = Date.now();
            const cutoff = now - (minutes * 60 * 1000);
            return await client.zcount(ACTIVE_USERS_KEY, cutoff, '+inf');
        } catch (e) {
            return 0;
        }
    }

    /**
     * Cleans up users inactive for more than 1 hour (maintenance)
     */
    async cleanupInactiveUsers() {
        const client = redis.getClient();
        if (!client) return;
        try {
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            await client.zremrangebyscore(ACTIVE_USERS_KEY, '-inf', oneHourAgo);
        } catch (e) { }
    }

    /**
     * Stores ephemeral data for a user session (e.g. "viewed_stocks")
     * Uses Redis HASH for memory efficiency: session:{userId} -> { key: value }
     */
    async setSessionData(userId: string, key: string, value: any) {
        const sessionKey = `session:${userId}`;
        // Use safe wrapper that handles pipeline and errors
        await redis.hSetWithExpiry(sessionKey, key, JSON.stringify(value), SESSION_TTL);
    }

    async getSessionData<T>(userId: string, key: string): Promise<T | null> {
        const sessionKey = `session:${userId}`;
        const data = await redis.hget(sessionKey, key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Delete a specific session data field
     */
    async deleteSessionData(userId: string, key: string) {
        return redis.hdel(`session:${userId}`, key);
    }
}

export const sessionManager = new SessionManager();
