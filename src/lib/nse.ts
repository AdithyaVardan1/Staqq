import { NseIndia } from 'stock-nse-india';
import { redis } from './redis';

const nse = new NseIndia();

// Data lives in cache for 5 minutes, but is considered "fresh" for only 60s.
// After 60s, the next request triggers a background refresh while still
// serving the stale-but-not-expired data instantly. Cold start (>5min or
// first ever request) is the only time a user waits on a live NSE fetch.
const DATA_TTL = 300;  // keep data in cache 5 minutes
const FRESH_TTL = 55;  // background refresh triggers after 55s

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

let refreshPromise: Promise<NseStock[]> | null = null;

async function fetchFromNse(): Promise<NseStock[]> {
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

    const payload = JSON.stringify(stocks);
    // Write data and freshness marker in parallel
    await Promise.all([
        redis.set('nse:nifty500:data', payload, DATA_TTL),
        redis.set('nse:nifty500:fresh', '1', FRESH_TTL),
    ]);
    return stocks;
}

export async function getNifty500(): Promise<NseStock[]> {
    const [cached, isFresh] = await Promise.all([
        redis.get('nse:nifty500:data'),
        redis.get('nse:nifty500:fresh'),
    ]);

    if (cached) {
        if (!isFresh && !refreshPromise) {
            // Stale — kick off background refresh, serve current data now
            refreshPromise = fetchFromNse().finally(() => { refreshPromise = null; });
        }
        try { return JSON.parse(cached); } catch { /* fall through to live fetch */ }
    }

    // Cold start — wait for live data (only happens once per 5 minutes max)
    if (refreshPromise) return refreshPromise;
    refreshPromise = fetchFromNse().finally(() => { refreshPromise = null; });
    return refreshPromise;
}
