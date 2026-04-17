import { NextResponse } from 'next/server';
import { getCryptoSignals } from '@/lib/crypto-signals';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // For now all users get pro view in the API — gating happens on the page
        const signals = await getCryptoSignals(true);
        return NextResponse.json({ signals, count: signals.length });
    } catch (error: any) {
        console.error('[Crypto Signals API]', error.message);
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }
}
