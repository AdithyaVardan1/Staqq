// ─── Spike Detection Engine ─────────────────────────────────────────
// Detects when a stock ticker's Reddit mention count surges above
// its 24h rolling average. Uses Redis time-bucketed counters.
// ─────────────────────────────────────────────────────────────────────

import { redis } from './redis';
import { getAllPosts } from './social';
import type { SocialPost } from './social';

export interface SpikeResult {
    ticker: string;
    mentionCount: number;
    baselineAvg: number;
    spikeMult: number;
    topPost: SocialPost | null;
}

// ─── Config ──────────────────────────────────────────────────────────

const BUCKET_MS = 15 * 60 * 1000;        // 15 minutes
const WINDOW_BUCKETS = 96;                // 24 hours of 15-min buckets
const BUCKET_TTL = 26 * 60 * 60;          // 26h TTL per bucket key
const COOLDOWN_TTL = 2 * 60 * 60;         // 2h cooldown between duplicate alerts
const MIN_BASELINE_BUCKETS = 4;           // Need at least 1h of data before alerting

const SPIKE_MULTIPLIER = parseFloat(process.env.SPIKE_MULTIPLIER_THRESHOLD ?? '3');
const MIN_MENTIONS = parseInt(process.env.SPIKE_MIN_MENTIONS ?? '3', 10);

// ─── Redis Key Helpers ───────────────────────────────────────────────

function getBucketTs(offsetBuckets = 0): number {
    return Math.floor(Date.now() / BUCKET_MS) * BUCKET_MS - offsetBuckets * BUCKET_MS;
}

function bucketKey(ticker: string, bucketTs: number): string {
    return `mentions:${ticker}:${bucketTs}`;
}

// ─── Core Functions ──────────────────────────────────────────────────

async function recordMentions(tickerCounts: Record<string, number>): Promise<boolean> {
    const client = redis.getClient();
    if (!client) {
        console.error('[SpikeDetector] Redis unavailable — cannot record mentions');
        return false;
    }

    const currentBucket = getBucketTs();

    try {
        const pipeline = client.pipeline();
        for (const [ticker, count] of Object.entries(tickerCounts)) {
            const key = bucketKey(ticker, currentBucket);
            pipeline.incrby(key, count);
            pipeline.expire(key, BUCKET_TTL);
        }
        await pipeline.exec();
        return true;
    } catch (err) {
        console.error('[SpikeDetector] Failed to record mentions:', err);
        return false;
    }
}

async function getTickerStats(ticker: string): Promise<{
    current: number;
    baselineAvg: number;
    totalBucketsWithData: number;
} | null> {
    const client = redis.getClient();
    if (!client) return null;

    const currentBucket = getBucketTs();

    try {
        const pipeline = client.pipeline();
        // Current bucket
        pipeline.get(bucketKey(ticker, currentBucket));
        // Past 96 buckets (24h)
        for (let i = 1; i <= WINDOW_BUCKETS; i++) {
            pipeline.get(bucketKey(ticker, currentBucket - i * BUCKET_MS));
        }
        const results = await pipeline.exec();
        if (!results) return null;

        const current = parseInt((results[0]?.[1] as string) || '0', 10);

        // Include ALL past buckets (including zeros) for accurate baseline.
        // But track how many buckets had any data to detect cold start.
        let total = 0;
        let bucketsWithData = 0;
        for (let i = 1; i <= WINDOW_BUCKETS; i++) {
            const val = parseInt((results[i]?.[1] as string) || '0', 10);
            total += val;
            if (val > 0) bucketsWithData++;
        }

        // Use total buckets scanned as denominator (not just non-zero ones)
        // This gives an accurate "average per 15-min window over 24h"
        const baselineAvg = total / WINDOW_BUCKETS;

        return { current, baselineAvg, totalBucketsWithData: bucketsWithData };
    } catch {
        return null;
    }
}

// Atomic cooldown: SET NX returns true only if key didn't exist.
// This prevents race conditions between check and set.
async function trySetCooldown(ticker: string): Promise<boolean> {
    const client = redis.getClient();
    if (!client) return false;

    try {
        // SET key value EX ttl NX — only sets if key doesn't exist
        const result = await client.set(`spike:cooldown:${ticker}`, '1', 'EX', COOLDOWN_TTL, 'NX');
        return result === 'OK'; // true = we set it (no prior cooldown), false = already cooling down
    } catch {
        return false;
    }
}

// ─── Main Scan ───────────────────────────────────────────────────────

export async function scanForSpikes(): Promise<SpikeResult[]> {
    const posts = await getAllPosts();

    if (posts.length === 0) {
        console.warn('[SpikeDetector] No posts fetched — Reddit may be down or rate-limiting');
        return [];
    }

    // Count mentions per ticker and track top post (by score)
    const tickerCounts: Record<string, number> = {};
    const tickerTopPost: Record<string, SocialPost> = {};

    for (const post of posts) {
        for (const ticker of post.tickers) {
            tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
            if (!tickerTopPost[ticker] || post.score > tickerTopPost[ticker].score) {
                tickerTopPost[ticker] = post;
            }
        }
    }

    // Record all mentions into current Redis bucket
    const recorded = await recordMentions(tickerCounts);
    if (!recorded) {
        console.error('[SpikeDetector] Failed to record mentions — aborting spike check');
        return [];
    }

    console.log(`[SpikeDetector] Recorded mentions for ${Object.keys(tickerCounts).length} tickers from ${posts.length} posts`);

    // Check each ticker for spikes
    const spikes: SpikeResult[] = [];
    const tickers = Object.keys(tickerCounts);

    await Promise.all(
        tickers.map(async (ticker) => {
            const stats = await getTickerStats(ticker);
            if (!stats) return;

            const { current, baselineAvg, totalBucketsWithData } = stats;

            // Need minimum mentions in current bucket
            if (current < MIN_MENTIONS) return;

            // Cold start: need enough historical data to have a meaningful baseline
            if (totalBucketsWithData < MIN_BASELINE_BUCKETS) return;

            // If baseline is near zero but we have data, use a floor to prevent
            // division by tiny numbers causing massive false-positive multipliers
            const effectiveBaseline = Math.max(baselineAvg, 0.5);
            const spikeMult = current / effectiveBaseline;

            if (spikeMult < SPIKE_MULTIPLIER) return;

            // Atomic cooldown: trySetCooldown returns true only if we're
            // the first to set it (no race condition with concurrent scans)
            const gotLock = await trySetCooldown(ticker);
            if (!gotLock) return; // Another scan already handled this spike

            spikes.push({
                ticker,
                mentionCount: current,
                baselineAvg: Math.round(effectiveBaseline * 100) / 100,
                spikeMult: Math.round(spikeMult * 10) / 10,
                topPost: tickerTopPost[ticker] || null,
            });
        })
    );

    return spikes;
}
