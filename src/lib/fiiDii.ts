// ─── FII/DII Daily Flow Data ─────────────────────────────────────────
// Fetches Foreign & Domestic Institutional Investor buy/sell data from NSE.
// ─────────────────────────────────────────────────────────────────────

import { nseGet } from './nseClient';

export interface FiiDiiEntry {
    category: 'FII' | 'DII';
    date: string;
    buyValue: number;   // in crores
    sellValue: number;  // in crores
    netValue: number;   // in crores
}

export interface FiiDiiDaily {
    date: string;
    fii: { buy: number; sell: number; net: number };
    dii: { buy: number; sell: number; net: number };
    totalNet: number;
}

interface NseFiiDiiResponse {
    category: string;
    date: string;
    buyValue: string;
    sellValue: string;
    netValue: string;
}

function parseValue(val: string): number {
    const num = parseFloat(val.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
}

export async function fetchFiiDiiToday(): Promise<FiiDiiDaily | null> {
    try {
        const data = await nseGet<NseFiiDiiResponse[]>('/api/fiidiiTradeReact');

        if (!data || !Array.isArray(data) || data.length === 0) return null;

        const fiiRow = data.find(d => d.category?.includes('FII') || d.category?.includes('FPI'));
        const diiRow = data.find(d => d.category?.includes('DII'));

        if (!fiiRow && !diiRow) return null;

        const fii = {
            buy: fiiRow ? parseValue(fiiRow.buyValue) : 0,
            sell: fiiRow ? parseValue(fiiRow.sellValue) : 0,
            net: fiiRow ? parseValue(fiiRow.netValue) : 0,
        };

        const dii = {
            buy: diiRow ? parseValue(diiRow.buyValue) : 0,
            sell: diiRow ? parseValue(diiRow.sellValue) : 0,
            net: diiRow ? parseValue(diiRow.netValue) : 0,
        };

        return {
            date: fiiRow?.date || diiRow?.date || new Date().toLocaleDateString('en-IN'),
            fii,
            dii,
            totalNet: fii.net + dii.net,
        };
    } catch (error) {
        console.error('[FII/DII] Fetch failed:', error);
        return null;
    }
}
