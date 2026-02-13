import { NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { stockCache } from '@/lib/stock-cache';

const execPromise = promisify(exec);

export const dynamic = 'force-dynamic';

async function fetchBatchYFinanceData(tickers: string[]): Promise<any> {
    if (tickers.length === 0) return {};
    try {
        const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'ybatch.py');
        // Use comma separated for simpler shell escaping
        const { stdout } = await execPromise(`python "${pythonScript}" "${tickers.join(',')}"`);
        return JSON.parse(stdout);
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

        // Filters
        const priceMin = parseFloat(searchParams.get('priceMin') || '0');
        const priceMax = parseFloat(searchParams.get('priceMax') || '1000000');
        const sector = searchParams.get('sector');
        const peMax = parseFloat(searchParams.get('peMax') || '1000');

        console.log(`[Screener API] Fetching from offset ${offset} with limit ${limit}`);

        const tokensMap = await angelOne.getInstrumentTokens();
        if (!tokensMap) throw new Error('Failed to load instrument tokens');

        // 1. Get filtered NSE stocks universe (all eligible stocks)
        const universe: any[] = [];
        for (const [key, instrument] of tokensMap.entries()) {
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
        universe.sort((a, b) => a.ticker.localeCompare(b.ticker));

        // 2. Depth Search Logic
        // Scan through the universe starting from offset until we find 'limit' matches OR hit MAX_SCAN
        const MAX_SCAN = 500;
        let currentIdx = offset;
        const matchedStocks: any[] = [];
        let finalNextOffset = offset;

        // Loop until we have enough matches OR we've scanned MAX_SCAN stocks
        // We try to find at least 1 match if they exist to avoid returning empty pages
        while (currentIdx < universe.length && (currentIdx - offset) < MAX_SCAN) {
            // Take a chunk to process
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

            // Batch fetch missing
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

                // Now rebuild localEnriched from batch to ensure correct data
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

            // Add to matched
            for (const s of filteredChunk) {
                if (matchedStocks.length < limit) {
                    matchedStocks.push(s);
                }
            }

            // Advance index
            currentIdx += batch.length;
            finalNextOffset = currentIdx;

            // Stop if we have enough matches
            if (matchedStocks.length >= limit) break;

            // Optimization: If we have at least SOME matches and have scanned a decent amount,
            // we can stop to return quickly, unless the user specifically needs the full limit.
            // But for infinity scroll, returning even 2-3 items is better than scanning 500.
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
