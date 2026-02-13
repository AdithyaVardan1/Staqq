import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-forwarded-for') || 'anonymous';
        const key = `recently_viewed:${userId}`;

        const tickers = await redis.lrange(key, 0, 9);
        return NextResponse.json({ tickers });
    } catch (error: any) {
        console.error('[API/RecentlyViewed] GET Error:', error.message);
        return NextResponse.json({ tickers: [] });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { ticker } = await req.json();
        if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

        const userId = req.headers.get('x-forwarded-for') || 'anonymous';
        const key = `recently_viewed:${userId}`;

        // Add to user's recent list
        await redis.lpush(key, ticker.toUpperCase(), 10);

        // Also increment global trending score
        await redis.zincrby('trending_stocks', 1, ticker.toUpperCase());

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API/RecentlyViewed] POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
