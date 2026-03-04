import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/newsletter/trigger-send
 * Body: { mode: 'test' | 'production', testEmail?: string }
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode, testEmail } = await req.json().catch(() => ({}));

    // Derive the base URL from the incoming request so this works in
    // local dev (localhost:3000) AND production (staqq.in) without config.
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (mode === 'test') {
        if (!testEmail) {
            return NextResponse.json({ error: 'testEmail required for test mode' }, { status: 400 });
        }
        const res = await fetch(`${origin}/api/newsletter/test-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
            body: JSON.stringify({ email: testEmail }),
        });
        const data = await res.json().catch(() => ({ error: 'Invalid response from test-send' }));
        return NextResponse.json(data, { status: res.status });
    }

    if (mode === 'production') {
        const res = await fetch(`${origin}/api/newsletter/send-weekly`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
        });
        const data = await res.json().catch(() => ({ error: 'Invalid response from send-weekly' }));
        return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ error: 'mode must be "test" or "production"' }, { status: 400 });
}
