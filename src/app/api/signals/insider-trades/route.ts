import { NextResponse } from 'next/server';
import { fetchInsiderTrades } from '@/lib/insiderTrades';

export const revalidate = 900;

export async function GET() {
    try {
        const trades = await fetchInsiderTrades(7);
        return NextResponse.json({ trades, count: trades.length });
    } catch (error: any) {
        console.error('[API] Insider trades error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch insider trades' }, { status: 500 });
    }
}
