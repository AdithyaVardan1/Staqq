import { nseGet } from './nseClient';

export interface FiiDiiEntry {
    category: 'FII' | 'DII';
    date: string;
    buyValue: number;
    sellValue: number;
    netValue: number;
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

function formatNseDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
}

export async function fetchFiiDiiHistory(days = 10): Promise<FiiDiiDaily[]> {
    try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        const data = await nseGet<NseFiiDiiResponse[]>(
            `/api/fiidiiTradeReact?from_date=${formatNseDate(from)}&to_date=${formatNseDate(to)}`
        );

        if (!data || !Array.isArray(data) || data.length === 0) return [];

        const byDate: Record<string, { fii?: NseFiiDiiResponse; dii?: NseFiiDiiResponse }> = {};
        for (const row of data) {
            const key = row.date || '';
            if (!key) continue;
            if (!byDate[key]) byDate[key] = {};
            if (row.category?.includes('FII') || row.category?.includes('FPI')) byDate[key].fii = row;
            if (row.category?.includes('DII')) byDate[key].dii = row;
        }

        return Object.entries(byDate)
            .map(([date, { fii, dii }]) => {
                const f = { buy: fii ? parseValue(fii.buyValue) : 0, sell: fii ? parseValue(fii.sellValue) : 0, net: fii ? parseValue(fii.netValue) : 0 };
                const d = { buy: dii ? parseValue(dii.buyValue) : 0, sell: dii ? parseValue(dii.sellValue) : 0, net: dii ? parseValue(dii.netValue) : 0 };
                return { date, fii: f, dii: d, totalNet: f.net + d.net };
            })
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-days);
    } catch {
        return [];
    }
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
