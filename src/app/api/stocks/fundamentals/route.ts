import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { angelOne } from '@/lib/angelone';
import { stockCache } from '@/lib/stock-cache';
import { checkRateLimit } from '@/lib/rate-limiter';

const execPromise = promisify(exec);

export const dynamic = 'force-dynamic';

// Helper to calculate technical indicators
async function fetchTechnicals(ticker: string): Promise<any> {
    try {
        const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'calculate_technicals.py');
        const pythonExecutable = path.join(process.cwd(), '.venv/bin/python3');
        const { stdout } = await execPromise(`"${pythonExecutable}" "${pythonScript}" "${ticker}"`);
        const result = JSON.parse(stdout);
        return result.indicators || [];
    } catch (error) {
        console.error('[Fundamentals] Failed to calculate technicals:', error);
        return [];
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ticker = searchParams.get('ticker');
        const invalidate = searchParams.get('invalidate') === 'true';

        if (!ticker) {
            return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
        }

        // Apply Rate Limit (30 req/min for fundamentals)
        const isAllowed = await checkRateLimit('fundamentals_api', 30, 60);
        if (!isAllowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        // Check cache for full data
        const cacheKey = `full_${ticker}`;
        const cached = invalidate ? null : await stockCache.get(cacheKey);
        if (cached) {
            console.log(`[Fundamentals API] Cache Hit: ${ticker}`);
            return NextResponse.json({
                fundamentals: cached,
                source: 'cache'
            });
        }

        console.log(`[Fundamentals API] Fetching data for: ${ticker}`);

        // ... rest of the existing fetching logic ...
        const [yfinanceResult, technicalsResult] = await Promise.allSettled([
            (async () => {
                const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'yinfo.py');
                const pythonExecutable = path.join(process.cwd(), '.venv/bin/python3');
                const { stdout } = await execPromise(`"${pythonExecutable}" "${pythonScript}" "${ticker}"`);
                return JSON.parse(stdout);
            })(),
            fetchTechnicals(ticker)
        ]);

        if (yfinanceResult.status !== 'fulfilled' || !yfinanceResult.value || yfinanceResult.value.error) {
            const errorMsg = yfinanceResult.status === 'fulfilled' ? yfinanceResult.value?.error : 'Failed to fetch yfinance data';
            throw new Error(errorMsg || 'Failed to fetch yfinance data');
        }

        const result = yfinanceResult.value;

        if (technicalsResult.status === 'fulfilled' && technicalsResult.value && technicalsResult.value.length > 0) {
            result.technicals = technicalsResult.value;
        }

        try {
            const instrument = await angelOne.findInstrument(ticker);
            if (instrument) {
                // Fetch fundamentals and LTP in parallel
                const [angelRes, quoteRes] = await Promise.all([
                    angelOne.getFundamentalData(instrument.exchange, String(instrument.token)),
                    angelOne.getFullQuote(instrument.exchange, instrument.symbol, String(instrument.token))
                ]);

                if (quoteRes && quoteRes.status && quoteRes.data && quoteRes.data.length > 0) {
                    const quote = quoteRes.data[0];
                    result.price = parseFloat(quote.ltp);
                    result.netChange = parseFloat(quote.netChange || '0');
                    result.percentChange = parseFloat(quote.percentChange || '0');
                }

                // Ensure netChange exists even if only percentChange came from yfinance
                if (result.percentChange && !result.netChange && result.price) {
                    result.netChange = (result.price * (result.percentChange / 100));
                }

                if (angelRes && angelRes.status && angelRes.data) {
                    const fundamentalData = angelRes.data;

                    // Shareholding Pattern
                    if (fundamentalData.ShareholdingPattern) {
                        const sh = fundamentalData.ShareholdingPattern;
                        result.shareholding = [
                            { name: 'Promoters', value: parseFloat(sh.Promoter || '0'), color: '#22C55E' },
                            { name: 'FII', value: parseFloat(sh.FII || '0'), color: '#3B82F6' },
                            { name: 'DII', value: parseFloat(sh.DII || '0'), color: '#8B5CF6' },
                            { name: 'Public', value: parseFloat(sh.Public || '0'), color: '#F59E0B' },
                        ];
                    }

                    // ROE and Dividend Yield from Angel One
                    if (fundamentalData.Fundamental) {
                        const f = fundamentalData.Fundamental;
                        if (f.ROE) result.roe = parseFloat(f.ROE) / 100;
                        if (f.DividendYield) {
                            const rawDiv = parseFloat(f.DividendYield);
                            result.divYield = rawDiv / 1000000; // Divide by 1,000,000 (Basis points correction)
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[Fundamentals API] Angel One extraction failed for ${ticker}:`, e);
        }

        if (!result.shareholding || result.shareholding.length === 0) {
            result.shareholding = [
                { name: 'Promoters', value: 0, color: '#22C55E' },
                { name: 'FII', value: 0, color: '#3B82F6' },
                { name: 'DII', value: 0, color: '#8B5CF6' },
                { name: 'Public', value: 0, color: '#F59E0B' },
            ];
        }

        // Cache the final result
        await stockCache.set(cacheKey, result);

        return NextResponse.json({
            fundamentals: result,
            source: 'yfinance-python'
        });

    } catch (error: any) {
        console.error('[Fundamentals API] Error:', error);
        return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
    }
}
