import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
    try {
        // Fetch top 5 trending stocks
        const tickers = await redis.zrevrange('trending_stocks', 0, 4);
        return NextResponse.json({ tickers });
    } catch (error: any) {
        console.error('[API/Trending] GET Error:', error.message);
        return NextResponse.json({ tickers: [] });
    }
}
