import { NextRequest, NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { checkAndIncrementUsage } from '@/lib/subscription';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    // Free-tier rate limiting (5 lookups/day)
    const user = await getUserFromRequest(request);
    if (user) {
        const { allowed, current, limit } = await checkAndIncrementUsage(user.id, 'stock_lookups');
        if (!allowed) {
            return NextResponse.json(
                { error: 'Daily lookup limit reached', upgrade: true, current, limit },
                { status: 429 }
            );
        }
    }

    try {
        console.log(`[Search API] Searching for: "${query}"`);

        // 1. Search AngelOne master list
        let angelResults: any[] = [];
        try {
            angelResults = await angelOne.searchInstruments(query);
            console.log(`[Search API] AngelOne results: ${angelResults.length}`);
        } catch (err) {
            console.error('[Search API] AngelOne search failed:', err);
        }

        // 2. Search via yahoo-finance2 (Node.js, no Python needed)
        let yResults: any[] = [];
        try {
            const yahooFinance: any = (await import('yahoo-finance2')).default;
            const searchResult = await yahooFinance.search(query, { region: 'IN', lang: 'en-IN' });
            const quotes = searchResult?.quotes || [];
            yResults = quotes
                .filter((q: any) => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
                .map((q: any) => ({
                    symbol: q.symbol,
                    name: q.shortname || q.longname || q.symbol,
                    type: q.quoteType || 'EQUITY'
                }));
            console.log(`[Search API] Yahoo results: ${yResults.length}`);
        } catch (yErr) {
            console.error('[Search API] Yahoo search failed:', yErr);
        }

        if (yResults.length > 0) {
            // Map Yahoo symbols to AngelOne tickers where possible
            const mappedYResults = await Promise.all(yResults.map(async (r: any) => {
                try {
                    const baseSymbol = r.symbol.split('.')[0];
                    const exchange = r.symbol.endsWith('.NS') ? 'NSE' : 'BSE';

                    const token = await angelOne.findToken(baseSymbol);
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

            const filteredYResults = mappedYResults.filter((r: any) =>
                r !== null && !angelResults.some(ar => ar.symbol === r.symbol)
            );

            const combined = [...angelResults, ...filteredYResults].slice(0, 15);

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
