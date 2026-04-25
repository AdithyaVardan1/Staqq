import { NextResponse } from 'next/server';
import { getNifty500 } from '@/lib/nse';
import { getTrendingTickers } from '@/lib/social';

export const dynamic = 'force-dynamic';

// ffmc thresholds in rupees (NSE classification)
const LARGE_CAP = 200_000_000_000; // ₹20,000 Cr+
const MID_CAP   =  50_000_000_000; // ₹5,000–20,000 Cr
// Small cap = below MID_CAP

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const offset    = parseInt(searchParams.get('offset') || '0');
        const limit     = parseInt(searchParams.get('limit') || '10');
        const sortBy    = searchParams.get('sortBy') || 'marketCap';
        const priceMin  = parseFloat(searchParams.get('priceMin') || '0');
        const priceMax  = parseFloat(searchParams.get('priceMax') || '1000000');
        const sector    = searchParams.get('sector') || 'all';
        const mcap      = searchParams.get('mcap') || 'all'; // all | large | mid | small
        const return1Y  = searchParams.get('return1Y') || 'all'; // all | positive | top10 | top30

        let stocks = await getNifty500();

        stocks = stocks.filter(s => {
            if (s.price < priceMin || s.price > priceMax) return false;

            if (sector !== 'all' && !s.sector.toLowerCase().includes(sector.toLowerCase())) return false;

            if (mcap === 'large' && s.marketCap < LARGE_CAP) return false;
            if (mcap === 'mid'   && (s.marketCap < MID_CAP || s.marketCap >= LARGE_CAP)) return false;
            if (mcap === 'small' && s.marketCap >= MID_CAP) return false;

            if (return1Y === 'positive' && s.return1Y <= 0) return false;
            if (return1Y === 'top10'    && s.return1Y < 10) return false;
            if (return1Y === 'top30'    && s.return1Y < 30) return false;

            return true;
        });

        if (sortBy === 'marketCap') {
            stocks.sort((a, b) => b.marketCap - a.marketCap);
        } else if (sortBy === 'price-high') {
            stocks.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'price-low') {
            stocks.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'returns') {
            stocks.sort((a, b) => b.return1Y - a.return1Y);
        } else if (sortBy === 'trending') {
            const trendingTickers = await getTrendingTickers();
            const trendingSet = new Set(trendingTickers);
            stocks.sort((a, b) => {
                const aT = trendingSet.has(a.symbol);
                const bT = trendingSet.has(b.symbol);
                if (aT && !bT) return -1;
                if (!aT && bT) return 1;
                return b.marketCap - a.marketCap;
            });
        }

        const page = stocks.slice(offset, offset + limit);

        return NextResponse.json({
            stocks: page.map(s => ({
                ticker: s.symbol,
                name: s.name,
                price: s.price,
                change: s.change,
                changeAmount: s.changeAmount,
                marketCap: s.marketCap,
                peRatio: 0,
                sector: s.sector,
                return1Y: s.return1Y,
                sparklineData: [],
            })),
            nextOffset: offset + limit,
            hasMore: offset + limit < stocks.length,
            total: stocks.length,
        });

    } catch (err: any) {
        console.error('[Screener] Error:', err);
        return NextResponse.json({ error: 'Screener unavailable' }, { status: 500 });
    }
}
