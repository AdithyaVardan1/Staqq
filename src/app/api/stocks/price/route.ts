import { NextRequest, NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const PRICE_CACHE_TTL = 10; // 10 seconds — multiple users watching same stock share one Angel One call

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    // Check Redis first — concurrent users watching same ticker all benefit
    const cacheKey = `live:price:${ticker.toUpperCase()}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        try {
            return NextResponse.json(JSON.parse(cached));
        } catch { /* fall through */ }
    }

    try {
        const instrument = await angelOne.findInstrument(ticker);
        if (!instrument) {
            return NextResponse.json({ error: `Instrument not found for ${ticker}` }, { status: 404 });
        }

        const quote = await angelOne.getFullQuote(instrument.exchange, instrument.symbol, String(instrument.token));

        if (quote?.status && quote.data?.length > 0) {
            const data = quote.data[0];
            const result = {
                ticker,
                price: parseFloat(data.ltp),
                change: parseFloat(data.netChange),
                changePercent: parseFloat(data.percentChange),
            };
            await redis.set(cacheKey, JSON.stringify(result), PRICE_CACHE_TTL);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Price unavailable' }, { status: 503 });

    } catch (error: any) {
        console.error('[API/Price] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
