import { NextResponse } from 'next/server';
import { fetchFiiDiiToday } from '@/lib/fiiDii';

export const revalidate = 900; // 15 min cache

export async function GET() {
    try {
        const data = await fetchFiiDiiToday();
        if (!data) {
            return NextResponse.json({ error: 'No FII/DII data available' }, { status: 404 });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API] FII/DII error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch FII/DII data' }, { status: 500 });
    }
}
