import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fire and forget - track activity
        await sessionManager.trackUserActivity(userId);

        // Periodically cleanup (randomly 1 in 100 requests to avoid cron)
        if (Math.random() < 0.01) {
            sessionManager.cleanupInactiveUsers();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SessionAPI] Error tracking session:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
