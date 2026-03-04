import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/newsletter/trigger-send
 * Body: { mode: 'test' | 'production', testEmail?: string }
 *
 * 'test'       → sends a single test email to testEmail
 * 'production' → fires the full weekly send to all subscribers
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode, testEmail } = await req.json().catch(() => ({}));
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (mode === 'test') {
        if (!testEmail) return NextResponse.json({ error: 'testEmail required for test mode' }, { status: 400 });

        const res = await fetch(`${appUrl}/api/newsletter/test-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
            body: JSON.stringify({ email: testEmail }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    }

    if (mode === 'production') {
        const res = await fetch(`${appUrl}/api/newsletter/send-weekly`, {
            method: 'POST',
            headers: { 'x-cron-secret': secret },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ error: 'mode must be "test" or "production"' }, { status: 400 });
}
