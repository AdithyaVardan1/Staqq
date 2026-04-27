import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session';

// Called from middleware (server-side only). Validate with internal secret so
// external callers can't spoof arbitrary user IDs into the activity tracker.
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-internal-secret');
    if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        await sessionManager.trackUserActivity(userId);

        if (Math.random() < 0.01) {
            sessionManager.cleanupInactiveUsers();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SessionAPI] Error tracking session:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
