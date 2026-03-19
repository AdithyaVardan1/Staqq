// ─── Bulk & Block Deals ──────────────────────────────────────────────
// Fetches large deal data from NSE's snapshot and historical APIs.
// ─────────────────────────────────────────────────────────────────────

import { nseGet } from './nseClient';

export interface BulkDeal {
    type: 'BULK' | 'BLOCK';
    date: string;
    symbol: string;
    name: string;
    clientName: string;
    buySell: 'BUY' | 'SELL';
    quantity: number;
    price: number;         // weighted avg trade price
    valueCr: number;       // quantity * price / 10000000
}

interface NseDealData {
    date: string;
    symbol: string;
    name: string;
    clientName: string;
    buySell: string;
    qty: string;
    watp: string;
}

interface NseSnapshotResponse {
    BULK_DEALS_DATA?: NseDealData[];
    BLOCK_DEALS_DATA?: NseDealData[];
}

function parseDeal(raw: NseDealData, type: 'BULK' | 'BLOCK'): BulkDeal {
    const qty = parseInt(raw.qty?.replace(/,/g, '') || '0', 10);
    const price = parseFloat(raw.watp?.replace(/,/g, '') || '0');
    return {
        type,
        date: raw.date || '',
        symbol: raw.symbol || '',
        name: raw.name || '',
        clientName: raw.clientName || '',
        buySell: (raw.buySell?.toUpperCase() === 'BUY' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
        quantity: qty,
        price,
        valueCr: Math.round((qty * price) / 10000000 * 100) / 100,
    };
}

export async function fetchTodayDeals(): Promise<BulkDeal[]> {
    try {
        const data = await nseGet<NseSnapshotResponse>('/api/snapshot-capital-market-largedeal');

        const deals: BulkDeal[] = [];

        if (data?.BULK_DEALS_DATA) {
            deals.push(...data.BULK_DEALS_DATA.map(d => parseDeal(d, 'BULK')));
        }
        if (data?.BLOCK_DEALS_DATA) {
            deals.push(...data.BLOCK_DEALS_DATA.map(d => parseDeal(d, 'BLOCK')));
        }

        // Sort by value descending
        deals.sort((a, b) => b.valueCr - a.valueCr);

        return deals;
    } catch (error) {
        console.error('[Bulk Deals] Fetch failed:', error);
        return [];
    }
}

export async function fetchHistoricalDeals(days = 7): Promise<BulkDeal[]> {
    try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        const formatDate = (d: Date) => {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            return `${dd}-${mm}-${d.getFullYear()}`;
        };

        const fromStr = formatDate(from);
        const toStr = formatDate(to);

        const [bulkData, blockData] = await Promise.allSettled([
            nseGet<NseDealData[]>(`/api/historical/bulk-deals?from=${fromStr}&to=${toStr}`),
            nseGet<NseDealData[]>(`/api/historical/block-deals?from=${fromStr}&to=${toStr}`),
        ]);

        const deals: BulkDeal[] = [];

        if (bulkData.status === 'fulfilled' && Array.isArray(bulkData.value)) {
            deals.push(...bulkData.value.map(d => parseDeal(d, 'BULK')));
        }
        if (blockData.status === 'fulfilled' && Array.isArray(blockData.value)) {
            deals.push(...blockData.value.map(d => parseDeal(d, 'BLOCK')));
        }

        deals.sort((a, b) => b.valueCr - a.valueCr);
        return deals.slice(0, 100);
    } catch (error) {
        console.error('[Historical Deals] Fetch failed:', error);
        return [];
    }
}
