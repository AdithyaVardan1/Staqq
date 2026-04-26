import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sessionManager } from '@/lib/session';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

async function resolveUserId(req: NextRequest): Promise<string> {
    const user = await getUserFromRequest(req);
    if (user) return `uid:${user.id}`;
    // Anonymous fallback -- IP is not spoofable from Vercel's trusted proxy
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
    return `ip:${ip}`;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await resolveUserId(req);
        const tickers = await sessionManager.getSessionData<string[]>(userId, 'recent_stocks');
        return NextResponse.json({ tickers: tickers || [] });
    } catch (error: any) {
        console.error('[API/RecentlyViewed] GET Error:', error.message);
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

        let currentList = await sessionManager.getSessionData<string[]>(userId, 'recent_stocks') || [];
        currentList = currentList.filter(t => t !== ticker.toUpperCase());
        currentList.unshift(ticker.toUpperCase());
        if (currentList.length > 10) currentList = currentList.slice(0, 10);

        await sessionManager.setSessionData(userId, 'recent_stocks', currentList);
        await redis.zincrby('trending_stocks', 1, ticker.toUpperCase());

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API/RecentlyViewed] POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
