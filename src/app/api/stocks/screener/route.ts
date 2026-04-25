import { NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { redis } from '@/lib/redis';
import { getTrendingTickers } from '@/lib/social';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

// ── Fundamentals cache (P/E, market cap, sector) ─────────────────────
// These don't change real-time — cache 24 hours in Redis.
const FUNDAMENTALS_TTL = 86400; // 24h
const PRICE_TTL = 300;          // 5 minutes for real-time prices
const FETCH_LOCK_TTL = 15;      // seconds — lock held while fetching a batch

// ── Redis lock helper ─────────────────────────────────────────────────
// Prevents multiple concurrent cold-cache fetches for the same batch.
// Returns true if lock was acquired, false if someone else already holds it.
async function acquireLock(key: string): Promise<boolean> {
    const client = redis.getClient();
    if (!client) return true; // Redis down → allow fetch (no protection, but works)
    try {
        const result = await client.set(`lock:${key}`, '1', 'EX', FETCH_LOCK_TTL, 'NX');
        return result === 'OK';
    } catch {
        return true; // fail open
    }
}

async function releaseLock(key: string) {
    await redis.del(`lock:${key}`);
}

// Wait up to 12 seconds for a lock to release (polls every 300ms)
async function waitForLock(key: string): Promise<void> {
    const maxWait = 12000;
    const poll = 300;
    let waited = 0;
    while (waited < maxWait) {
        const client = redis.getClient();
        if (!client) return;
        try {
            const held = await client.exists(`lock:${key}`);
            if (!held) return;
        } catch { return; }
        await new Promise(r => setTimeout(r, poll));
        waited += poll;
    }
}

async function getFundamentals(ticker: string): Promise<{
    marketCap: number; peRatio: number; sector: string; return1Y: number;
} | null> {
    const key = `screener:fundamentals:${ticker}`;
    const cached = await redis.get(key);
    if (cached) {
        try { return JSON.parse(cached); } catch { /* fall through */ }
    }

    try {
        const yf = new yahooFinance();
        const q = await yf.quote(`${ticker}.NS`);
        if (!q) return null;
        const data = {
            marketCap: q.marketCap || 0,
            peRatio: q.trailingPE || 0,
            sector: q.sector || 'Unknown',
            return1Y: q.fiftyTwoWeekChangePercent ? q.fiftyTwoWeekChangePercent * 100 : 0,
        };
        await redis.set(key, JSON.stringify(data), FUNDAMENTALS_TTL);
        return data;
    } catch {
        return null;
    }
}

// ── Angel One real-time price cache ──────────────────────────────────
// Cached per-ticker in Redis for PRICE_TTL seconds.

async function getPriceCached(ticker: string): Promise<{
    price: number; change: number; changeAmount: number;
} | null> {
    const key = `screener:price:${ticker}`;
    const cached = await redis.get(key);
    if (cached) {
        try { return JSON.parse(cached); } catch { /* fall through */ }
    }
    return null; // caller will batch-fetch misses
}

async function storePriceCache(ticker: string, data: { price: number; change: number; changeAmount: number }) {
    await redis.set(`screener:price:${ticker}`, JSON.stringify(data), PRICE_TTL);
}

// ── Batch fetch prices from Angel One ────────────────────────────────
// Uses a Redis lock so concurrent requests don't all slam Angel One.
// The first request acquires the lock, fetches, stores in cache.
// Concurrent requests wait for the lock, then read from cache.

async function fetchAngelOnePrices(
    tickers: string[],
    tokensMap: Map<string, any>
): Promise<Record<string, { price: number; change: number; changeAmount: number }>> {
    if (tickers.length === 0) return {};

    // Build a stable lock key from the sorted ticker list
    const lockKey = `screener:batch:${tickers.slice().sort().join(',')}`;
    const acquired = await acquireLock(lockKey);

    if (!acquired) {
        // Another request is already fetching this batch — wait, then read from cache
        await waitForLock(lockKey);
        const fromCache: Record<string, { price: number; change: number; changeAmount: number }> = {};
        for (const ticker of tickers) {
            const hit = await getPriceCached(ticker);
            if (hit) fromCache[ticker] = hit;
        }
        return fromCache;
    }

    try {
        const nseTokens: string[] = [];
        const tokenToTicker: Record<string, string> = {};

        for (const ticker of tickers) {
            const instrument = tokensMap.get(`NSE:${ticker}-EQ`);
            if (instrument) {
                nseTokens.push(String(instrument.token));
                tokenToTicker[String(instrument.token)] = ticker;
            }
        }

        if (nseTokens.length === 0) return {};

        const quotes = await angelOne.batchMarketData(nseTokens, tokenToTicker);
        const results: Record<string, { price: number; change: number; changeAmount: number }> = {};

        for (const [ticker, q] of Object.entries(quotes)) {
            if (q.ltp > 0) {
                results[ticker] = { price: q.ltp, change: q.percentChange, changeAmount: q.netChange };
            }
        }

        return results;
    } finally {
        await releaseLock(lockKey);
    }
}

// ── Yahoo Finance price fallback ─────────────────────────────────────
// Used when Angel One returns nothing (market closed / auth failure).
// Results are cached for PRICE_TTL seconds.
async function getYahooPriceFallback(ticker: string): Promise<{
    price: number; change: number; changeAmount: number;
} | null> {
    const key = `screener:price:${ticker}`;
    const cached = await redis.get(key);
    if (cached) {
        try { return JSON.parse(cached); } catch { /* fall through */ }
    }
    try {
        const yf = new yahooFinance();
        const q = await yf.quote(`${ticker}.NS`);
        if (!q || !q.regularMarketPrice) return null;
        const price = q.regularMarketPrice;
        const change = q.regularMarketChangePercent || 0;
        const changeAmount = q.regularMarketChange || 0;
        const data = { price, change, changeAmount };
        await redis.set(key, JSON.stringify(data), PRICE_TTL);
        return data;
    } catch (e: any) {
        console.error(`[Yahoo Fallback] Error for ${ticker}:`, e.message);
        return null;
    }
}

// ── Route handler ─────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const offset = parseInt(searchParams.get('offset') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'marketCap';

        const priceMin = parseFloat(searchParams.get('priceMin') || '0');
        const priceMax = parseFloat(searchParams.get('priceMax') || '1000000');
        const sector = searchParams.get('sector');
        const peMax = parseFloat(searchParams.get('peMax') || '1000');

        // Load instrument master (cached in file + memory, 24h TTL)
        const tokensMap = await angelOne.getInstrumentTokens();
        if (!tokensMap || tokensMap.size === 0) {
            return NextResponse.json({ error: 'Instrument list unavailable' }, { status: 503 });
        }

        // Build NSE equity universe
        const universe: { ticker: string; name: string }[] = [];
        for (const [, instrument] of tokensMap.entries()) {
            if (
                instrument.exch_seg === 'NSE' &&
                instrument.symbol.endsWith('-EQ') &&
                !/TEST/i.test(instrument.symbol) &&
                !/TEST/i.test(instrument.name || '')
            ) {
                universe.push({
                    ticker: instrument.symbol.replace('-EQ', ''),
                    name: instrument.name || instrument.symbol.replace('-EQ', ''),
                });
            }
        }

        // Sort universe
        if (sortBy === 'trending') {
            const trendingTickers = await getTrendingTickers();
            const trendingSet = new Set(trendingTickers);
            universe.sort((a, b) => {
                const aT = trendingSet.has(a.ticker);
                const bT = trendingSet.has(b.ticker);
                if (aT && !bT) return -1;
                if (!aT && bT) return 1;
                return a.ticker.localeCompare(b.ticker);
            });
        } else {
            universe.sort((a, b) => a.ticker.localeCompare(b.ticker));
        }

        // Depth-search: scan stocks starting at offset
        // Strategy: try Angel One batch first; fallback to Yahoo per-ticker if AO returns nothing.
        const MAX_SCAN = 200;
        const CHUNK_SIZE = 20; // smaller chunks for faster iteration
        const matchedStocks: any[] = [];
        let currentIdx = offset;

        while (currentIdx < universe.length && currentIdx - offset < MAX_SCAN) {
            const chunk = universe.slice(currentIdx, currentIdx + CHUNK_SIZE);
            if (chunk.length === 0) break;

            // 1. Check per-ticker price cache first
            const priceMisses: string[] = [];
            const priceHits: Record<string, { price: number; change: number; changeAmount: number }> = {};

            for (const stock of chunk) {
                const hit = await getPriceCached(stock.ticker);
                if (hit) priceHits[stock.ticker] = hit;
                else priceMisses.push(stock.ticker);
            }

            // 2. Batch-fetch price misses from Angel One
            if (priceMisses.length > 0) {
                const fresh = await fetchAngelOnePrices(priceMisses, tokensMap);
                for (const [ticker, data] of Object.entries(fresh)) {
                    priceHits[ticker] = data;
                    await storePriceCache(ticker, data);
                }

                // 3. Yahoo fallback for anything Angel One missed
                const angelMisses = priceMisses.filter(t => !priceHits[t]);
                if (angelMisses.length > 0) {
                    // Fetch in parallel but cap concurrency at 5 to avoid rate limiting
                    const CONCURRENCY = 5;
                    for (let i = 0; i < angelMisses.length; i += CONCURRENCY) {
                        const batch = angelMisses.slice(i, i + CONCURRENCY);
                        const results = await Promise.allSettled(
                            batch.map(t => getYahooPriceFallback(t))
                        );
                        results.forEach((r, idx) => {
                            if (r.status === 'fulfilled' && r.value) {
                                priceHits[batch[idx]] = r.value;
                            }
                        });
                    }
                }
            }

            // 4. Fetch fundamentals only for stocks that have a price (from cache)
            const stocksWithPrice = chunk.filter(s => priceHits[s.ticker]?.price > 0);
            
            console.log(`[Screener Chunk] Found ${stocksWithPrice.length} stocks with price out of ${chunk.length}`);

            const fundamentalsArr = await Promise.allSettled(
                stocksWithPrice.map(s => getFundamentals(s.ticker))
            );

            // 5. Build enriched stocks and apply filters
            for (let j = 0; j < stocksWithPrice.length; j++) {
                const stock = stocksWithPrice[j];
                const priceData = priceHits[stock.ticker];
                if (!priceData || priceData.price <= 0) continue;

                const fundamentalsResult = fundamentalsArr[j];
                const fundamentals = fundamentalsResult.status === 'fulfilled' ? fundamentalsResult.value : null;

                const price = priceData.price;
                const marketCap = fundamentals?.marketCap || 0;
                const peRatio = fundamentals?.peRatio || 0;
                const stockSector = fundamentals?.sector || 'Unknown';
                const return1Y = fundamentals?.return1Y || 0;

                // Apply filters
                if (price < priceMin || price > priceMax) {
                    // console.log(`Skipping ${stock.ticker} due to price bounds`);
                    continue;
                }
                if (peMax < 1000 && (peRatio <= 0 || peRatio > peMax)) {
                    // console.log(`Skipping ${stock.ticker} due to peRatio ${peRatio}`);
                    continue;
                }
                if (sector && sector !== 'all' && stockSector !== sector) continue;

                if (matchedStocks.length < limit) {
                    matchedStocks.push({
                        ticker: stock.ticker,
                        name: stock.name,
                        price,
                        change: priceData.change,
                        changeAmount: priceData.changeAmount,
                        marketCap,
                        peRatio,
                        sector: stockSector,
                        return1Y,
                        sparklineData: [],
                    });
                }
            }

            currentIdx += chunk.length;
            if (matchedStocks.length >= limit) break;
        }

        return NextResponse.json({
            stocks: matchedStocks,
            nextOffset: currentIdx,
            hasMore: currentIdx < universe.length,
            total: universe.length,
        });

    } catch (err: any) {
        console.error('[Screener] Error:', err);
        return NextResponse.json({ error: 'Screener unavailable' }, { status: 500 });
    }
}


