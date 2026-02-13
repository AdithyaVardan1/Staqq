import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
    try {
        // Use IP or a static user id for now (demo purposes)
        const userId = req.headers.get('x-forwarded-for') || 'anonymous';
        const key = `recent_searches:${userId}`;

        const tickers = await redis.lrange(key, 0, 9);
        return NextResponse.json({ tickers });
    } catch (error: any) {
        console.error('[API/RecentSearches] GET Error:', error.message);
        return NextResponse.json({ tickers: [] });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { ticker } = await req.json();
        if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

        const userId = req.headers.get('x-forwarded-for') || 'anonymous';
        const key = `recent_searches:${userId}`;

        await redis.lpush(key, ticker.toUpperCase(), 10);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API/RecentSearches] POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
