import { redis } from './redis';

/**
 * Basic Sliding Window Rate Limiter using Redis
 * @param key Unique key for the limit (e.g. 'api:external')
 * @param limit Max requests allowed
 * @param windowSeconds Window duration in seconds
 * @returns {Promise<boolean>} True if allowed, false if limited
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
        const fullKey = `ratelimit:${key}`;
        const count = await redis.incr(fullKey, windowSeconds);

        if (count > limit) {
            return false;
        }
        return true;
    } catch (error) {
        console.error('[RateLimiter] Error:', error);
        return true; // Fallback to allowed on error to avoid blocking app
    }
}
