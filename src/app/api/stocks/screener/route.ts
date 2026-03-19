import { NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { stockCache } from '@/lib/stock-cache';
import { getTrendingTickers } from '@/lib/social';

export const dynamic = 'force-dynamic';

async function fetchBatchYFinanceData(tickers: string[]): Promise<Record<string, any>> {
    if (tickers.length === 0) return {};
    try {
        const yahooFinance: any = (await import('yahoo-finance2')).default;
        const symbols = tickers.map(t => t.endsWith('.NS') ? t : `${t}.NS`);
        const results: Record<string, any> = {};

        // Fetch quotes in parallel (batches of 10 to avoid rate limits)
        const batchSize = 10;
        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize);
            const quoteResults = await Promise.allSettled(
                batch.map((sym: string) => yahooFinance.quote(sym))
            );

            for (let j = 0; j < batch.length; j++) {
                const res = quoteResults[j];
                const baseTicker = tickers[i + j];
                if (res.status === 'fulfilled' && res.value) {
                    const q = res.value;
                    results[baseTicker] = {
                        currentPrice: q.regularMarketPrice || 0,
                        regularMarketChangePercent: q.regularMarketChangePercent || 0,
                        regularMarketChange: q.regularMarketChange || 0,
                        marketCap: q.marketCap || 0,
                        peRatio: q.trailingPE || 0,
                        sector: q.sector || 'Unknown',
                    };
                }
            }
        }

        return results;
    } catch (error) {
        console.error(`[Screener] Batch fetch failed:`, error);
        return {};
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const offset = parseInt(searchParams.get('offset') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy');

        // Filters
        const priceMin = parseFloat(searchParams.get('priceMin') || '0');
        const priceMax = parseFloat(searchParams.get('priceMax') || '1000000');
        const sector = searchParams.get('sector');
        const peMax = parseFloat(searchParams.get('peMax') || '1000');

        console.log(`[Screener API] Fetching offset=${offset} limit=${limit} sort=${sortBy}`);

        const tokensMap = await angelOne.getInstrumentTokens();
        if (!tokensMap) throw new Error('Failed to load instrument tokens');

        // 1. Get filtered NSE stocks universe (all eligible stocks)
        const universe: any[] = [];
        for (const [, instrument] of tokensMap.entries()) {
            if (instrument.exch_seg === 'NSE' && instrument.symbol.endsWith('-EQ')) {
                const cleanSymbol = instrument.symbol.replace('-EQ', '');
                if (/^\d{3}NSETEST$/i.test(cleanSymbol)) continue;
                if (cleanSymbol.toUpperCase().includes('TEST') || (instrument.name && instrument.name.toUpperCase().includes('TEST'))) continue;
                universe.push({
                    ticker: cleanSymbol,
                    symbol: `${cleanSymbol}.NS`,
                    name: instrument.name || cleanSymbol
                });
            }
        }

        // Sorting Logic
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

        // 2. Depth Search Logic
        const MAX_SCAN = 500;
        let currentIdx = offset;
        const matchedStocks: any[] = [];
        let finalNextOffset = offset;

        while (currentIdx < universe.length && (currentIdx - offset) < MAX_SCAN) {
            const chunkSize = 50;
            const batch = universe.slice(currentIdx, currentIdx + chunkSize);
            if (batch.length === 0) break;

            const tickersToFetch: string[] = [];
            const localEnriched: any[] = [];

            // Check cache
            for (const stock of batch) {
                const cached = await stockCache.get(stock.ticker);
                if (cached) {
                    localEnriched.push({ ...stock, ...cached });
                } else {
                    tickersToFetch.push(stock.ticker);
                }
            }

            // Batch fetch missing via yahoo-finance2
            if (tickersToFetch.length > 0) {
                const batchResults = await fetchBatchYFinanceData(tickersToFetch);
                for (const tSymbol of tickersToFetch) {
                    const bData = batchResults[tSymbol];
                    const enriched = {
                        price: bData?.currentPrice || 0,
                        change: bData?.regularMarketChangePercent || 0,
                        changeAmount: bData?.regularMarketChange || 0,
                        marketCap: bData?.marketCap || 0,
                        peRatio: bData?.peRatio || 0,
                        sector: bData?.sector || 'Unknown',
                        return1Y: bData?.return1Y || 0,
                        sparklineData: []
                    };
                    await stockCache.set(tSymbol, enriched);
                }

                // Rebuild localEnriched from batch
                for (const stock of batch) {
                    if (localEnriched.find(s => s.ticker === stock.ticker)) continue;
                    const cached = await stockCache.get(stock.ticker);
                    localEnriched.push({ ...stock, ...(cached || {}) });
                }
            }

            // Filter the enriched chunk
            const filteredChunk = localEnriched.filter(s => {
                const matchesPrice = s.price >= priceMin && s.price <= priceMax;
                const matchesPE = peMax >= 1000 || (s.peRatio > 0 && s.peRatio <= peMax);
                const matchesSector = !sector || sector === 'all' || s.sector === sector;
                return matchesPrice && matchesPE && matchesSector;
            });

            for (const s of filteredChunk) {
                if (matchedStocks.length < limit) {
                    matchedStocks.push(s);
                }
            }

            currentIdx += batch.length;
            finalNextOffset = currentIdx;

            if (matchedStocks.length >= limit) break;
            if (matchedStocks.length > 0 && (currentIdx - offset) >= 200) break;
        }

        const hasMore = finalNextOffset < universe.length;

        return NextResponse.json({
            stocks: matchedStocks,
            nextOffset: finalNextOffset,
            hasMore,
            total: universe.length
        });

    } catch (error: any) {
        console.error('[Screener API] Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
