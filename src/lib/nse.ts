import { NseIndia } from 'stock-nse-india';
import { redis } from './redis';

const nse = new NseIndia();
const CACHE_TTL = 60; // seconds — NSE data is real-time, cache lightly

export interface NseStock {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    change: number;       // % change
    changeAmount: number; // absolute change
    volume: number;
    marketCap: number;    // ffmc in rupees
    yearHigh: number;
    yearLow: number;
    return1Y: number;     // perChange365d
    nearHigh: number;     // % below 52w high (lower = closer to high)
    nearLow: number;      // negative % above 52w low (closer to 0 = near low)
}

export async function getNifty500(): Promise<NseStock[]> {
    const cacheKey = 'nse:nifty500';
    const cached = await redis.get(cacheKey);
    if (cached) {
        try { return JSON.parse(cached); } catch { /* fall through */ }
    }

    const data = await nse.getEquityStockIndices('NIFTY 500');
    const stocks: NseStock[] = (data.data as any[])
        .filter((s) => s.meta && s.series === 'EQ' && s.lastPrice > 0)
        .map((s) => ({
            symbol: s.symbol as string,
            name: (s.meta?.companyName || s.symbol) as string,
            sector: (s.meta?.industry || 'Unknown') as string,
            price: s.lastPrice as number,
            change: s.pChange as number,
            changeAmount: s.change as number,
            volume: s.totalTradedVolume as number,
            marketCap: s.ffmc as number,
            yearHigh: s.yearHigh as number,
            yearLow: s.yearLow as number,
            return1Y: (s.perChange365d || 0) as number,
            nearHigh: s.nearWKH as number,
            nearLow: s.nearWKL as number,
        }));

    await redis.set(cacheKey, JSON.stringify(stocks), CACHE_TTL);
    return stocks;
}
