import { NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        console.log(`[Search API] Searching for: "${query}"`);

        // 1. First, search AngelOne master list
        let angelResults = [];
        try {
            angelResults = await angelOne.searchInstruments(query);
            console.log(`[Search API] AngelOne results: ${angelResults.length}`);
        } catch (err) {
            console.error('[Search API] AngelOne search failed:', err);
        }

        // 2. Call Python yfinance bridge
        let yResults = [];
        try {
            const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'ysearch.py');
            console.log(`[Search API] Executing python script: ${pythonScript}`);
            const { stdout, stderr } = await execPromise(`python "${pythonScript}" "${query}"`);

            if (stderr) console.warn('[Search API] Python stderr:', stderr);

            try {
                yResults = JSON.parse(stdout);
                console.log(`[Search API] Yahoo results: ${yResults.length}`);
            } catch (jsonErr) {
                console.error('[Search API] Failed to parse Python output:', stdout);
            }
        } catch (pyErr) {
            console.error('[Search API] Python execution failed:', pyErr);
        }

        if (Array.isArray(yResults) && yResults.length > 0) {
            // Map Yahoo symbols to AngelOne tickers where possible
            const mappedYResults = await Promise.all(yResults
                .filter((r: any) => r.symbol.endsWith('.NS') || r.symbol.endsWith('.BO'))
                .map(async (r: any) => {
                    try {
                        const baseSymbol = r.symbol.split('.')[0];
                        const exchange = r.symbol.endsWith('.NS') ? 'NSE' : 'BSE';

                        // Verify if this exists in AngelOne
                        const token = await angelOne.findToken(baseSymbol, exchange);

                        if (token) {
                            return {
                                symbol: baseSymbol,
                                name: r.name,
                                exchange: exchange,
                                type: r.type,
                                token: token,
                                source: 'yfinance'
                            };
                        }
                    } catch (mapErr) {
                        console.error(`[Search API] Mapping error for ${r.symbol}:`, mapErr);
                    }
                    return null;
                }));

            // Filter out nulls and duplicates (that might already be in angelResults)
            const filteredYResults = mappedYResults.filter((r: any) =>
                r !== null && !angelResults.some(ar => ar.symbol === r.symbol)
            );

            // Combine results, prioritizing AngelOne direct matches
            const combined = [...angelResults, ...filteredYResults].slice(0, 15);

            // Final deduplication by key
            const unique = combined.filter((item, index, self) =>
                index === self.findIndex((t) => (
                    t.symbol === item.symbol && t.exchange === item.exchange
                ))
            );

            return NextResponse.json(unique);
        }

        return NextResponse.json(angelResults);
    } catch (error: any) {
        console.error('Search API Critical Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
