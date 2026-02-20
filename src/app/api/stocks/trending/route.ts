import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cached = await redis.get('trending_algorithm_result');
        if (!cached) {
            return NextResponse.json({ stocks: [] });
        }

        const data = JSON.parse(cached);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Trending API Error:', error);
        return NextResponse.json({ stocks: [] }, { status: 500 });
    }
}
