// ─── Insider / Promoter Trades (PIT Disclosures) ────────────────────
// Fetches insider trading disclosures from NSE's corporate filings API.
// ─────────────────────────────────────────────────────────────────────

import { nseGet } from './nseClient';

export interface InsiderTrade {
    symbol: string;
    company: string;
    personName: string;
    personCategory: string;    // Promoter, Director, KMP, etc.
    sharesAcquired: number;
    acquireMode: string;       // Market Purchase, Market Sale, Off Market, etc.
    beforePercent: string;
    afterPercent: string;
    transactionDate: string;
    intimationDate: string;
}

interface NsePitResponse {
    data: Array<{
        symbol: string;
        company: string;
        personCategory: string;
        personName: string;
        noSharesAcq: string;
        befAcqSharesPerc: string;
        aftAcqSharesPerc: string;
        acqMode: string;
        date: string;
        intimDate: string;
    }>;
}

function formatDateParam(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

export async function fetchInsiderTrades(days = 7): Promise<InsiderTrade[]> {
    try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        const fromStr = formatDateParam(from);
        const toStr = formatDateParam(to);

        const data = await nseGet<NsePitResponse>(
            `/api/corporates-pit?index=equities&from_date=${fromStr}&to_date=${toStr}`
        );

        if (!data?.data || !Array.isArray(data.data)) return [];

        return data.data
            .map(item => ({
                symbol: item.symbol || '',
                company: item.company || '',
                personName: item.personName || '',
                personCategory: item.personCategory || '',
                sharesAcquired: parseInt(item.noSharesAcq?.replace(/,/g, '') || '0', 10),
                acquireMode: item.acqMode || '',
                beforePercent: item.befAcqSharesPerc || '',
                afterPercent: item.aftAcqSharesPerc || '',
                transactionDate: item.date || '',
                intimationDate: item.intimDate || '',
            }))
            .filter(t => t.symbol && t.personName)
            .slice(0, 100); // Limit to latest 100
    } catch (error) {
        console.error('[Insider Trades] Fetch failed:', error);
        return [];
    }
}
