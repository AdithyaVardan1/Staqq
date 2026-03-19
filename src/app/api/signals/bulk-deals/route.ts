import { NextResponse } from 'next/server';
import { fetchTodayDeals, fetchHistoricalDeals } from '@/lib/bulkDeals';

export const revalidate = 900;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'today';

        let deals;
        if (mode === 'historical') {
            const days = parseInt(searchParams.get('days') || '7', 10);
            deals = await fetchHistoricalDeals(Math.min(days, 30));
        } else {
            deals = await fetchTodayDeals();
        }

        return NextResponse.json({ deals, count: deals.length });
    } catch (error: any) {
        console.error('[API] Bulk deals error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch bulk deals' }, { status: 500 });
    }
}
