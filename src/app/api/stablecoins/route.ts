import { NextResponse } from 'next/server';
import { getStablecoinData } from '@/lib/stablecoins';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const coins = await getStablecoinData();
        return NextResponse.json({ coins, count: coins.length });
    } catch (error: any) {
        console.error('[Stablecoins API]', error.message);
        return NextResponse.json({ error: 'Failed to fetch stablecoin data' }, { status: 500 });
    }
}
