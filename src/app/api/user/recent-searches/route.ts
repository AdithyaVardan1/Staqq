import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

async function resolveUserId(req: NextRequest): Promise<string> {
    const user = await getUserFromRequest(req);
    if (user) return `uid:${user.id}`;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
    return `ip:${ip}`;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await resolveUserId(req);
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
        if (!ticker || typeof ticker !== 'string') {
            return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
        }

        const userId = await resolveUserId(req);
        const key = `recent_searches:${userId}`;
        await redis.lpush(key, ticker.toUpperCase(), 10);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API/RecentSearches] POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
