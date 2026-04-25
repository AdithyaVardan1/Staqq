import { NextResponse } from 'next/server';
import { getNifty500 } from '@/lib/nse';
import { getTrendingTickers } from '@/lib/social';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const offset = parseInt(searchParams.get('offset') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'marketCap';

        const priceMin = parseFloat(searchParams.get('priceMin') || '0');
        const priceMax = parseFloat(searchParams.get('priceMax') || '1000000');
        const sectorFilter = searchParams.get('sector') || 'all';

        // Single NSE call — 500 stocks, real-time prices, market cap, sector, 1Y return
        let stocks = await getNifty500();

        // Apply filters
        stocks = stocks.filter(s => {
            if (s.price < priceMin || s.price > priceMax) return false;
            if (sectorFilter !== 'all' && !s.sector.toLowerCase().includes(sectorFilter.toLowerCase())) return false;
            return true;
        });

        // Sort
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
