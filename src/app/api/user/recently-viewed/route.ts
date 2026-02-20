import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sessionManager } from '@/lib/session';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-forwarded-for') || 'anonymous';
        // Retrieve directly from the consolidated session object
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
        if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

        const userId = req.headers.get('x-forwarded-for') || 'anonymous';

        // simple Read-Modify-Write (acceptable for per-user concurrency)
        let currentList = await sessionManager.getSessionData<string[]>(userId, 'recent_stocks') || [];

        // Remove duplicate if exists
        currentList = currentList.filter(t => t !== ticker.toUpperCase());
        // Add to front
        currentList.unshift(ticker.toUpperCase());
        // Limit to 10
        if (currentList.length > 10) currentList = currentList.slice(0, 10);

        // Save back to session
        await sessionManager.setSessionData(userId, 'recent_stocks', currentList);

        // Also increment global trending score (Global state, keep separate from session)
        await redis.zincrby('trending_stocks', 1, ticker.toUpperCase());

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API/RecentlyViewed] POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
