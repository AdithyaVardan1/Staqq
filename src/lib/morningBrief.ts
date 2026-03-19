// ─── Morning Brief Generator ────────────────────────────────────────
// Aggregates data from multiple sources into a single morning brief.
// Uses Promise.allSettled so individual source failures don't break
// the entire brief.
// ─────────────────────────────────────────────────────────────────────

import { fetchFiiDiiToday } from '@/lib/fiiDii';
import { getLiveIPOs, getUpcomingIPOs } from '@/lib/ipo';
import type { IPOData } from '@/lib/ipo';
import { fetchInsiderTrades } from '@/lib/insiderTrades';
import { fetchTodayDeals } from '@/lib/bulkDeals';
import { createAdminClient } from '@/utils/supabase/admin';

export interface MorningBrief {
    date: string;
    marketOverview: {
        fiiNet: number;
        diiNet: number;
        fiiBuy: number;
        fiiSell: number;
        diiBuy: number;
        diiSell: number;
    } | null;
    spikesLast24h: { ticker: string; multiplier: number; mentions: number }[];
    ipoUpdates: { name: string; status: string; gmp: string }[];
    topInsiderTrades: { company: string; person: string; type: string; value: string }[];
    topBulkDeals: { company: string; client: string; type: string; value: string }[];
}

function formatCr(val: number): string {
    const abs = Math.abs(val);
    if (abs >= 100) return `${val.toFixed(0)} Cr`;
    return `${val.toFixed(2)} Cr`;
}

function formatIpoGmp(ipo: IPOData): string {
    if (ipo.gmp === null || ipo.gmp === undefined) return 'N/A';
    const sign = ipo.gmp >= 0 ? '+' : '';
    const pct = ipo.gmpPercent !== null ? ` (${sign}${ipo.gmpPercent}%)` : '';
    return `${sign}${ipo.gmp}${pct}`;
}

export async function generateMorningBrief(): Promise<MorningBrief> {
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const [fiiDiiResult, liveIpoResult, upcomingIpoResult, insiderResult, bulkResult, spikesResult] =
        await Promise.allSettled([
            fetchFiiDiiToday(),
            getLiveIPOs(),
            getUpcomingIPOs(),
            fetchInsiderTrades(3),
            fetchTodayDeals(),
            fetchRecentSpikes(),
        ]);

    // ─── Market Overview ─────────────────────────────────────────────
    let marketOverview: MorningBrief['marketOverview'] = null;
    if (fiiDiiResult.status === 'fulfilled' && fiiDiiResult.value) {
        const d = fiiDiiResult.value;
        marketOverview = {
            fiiNet: d.fii.net,
            diiNet: d.dii.net,
            fiiBuy: d.fii.buy,
            fiiSell: d.fii.sell,
            diiBuy: d.dii.buy,
            diiSell: d.dii.sell,
        };
    }

    // ─── IPO Updates ─────────────────────────────────────────────────
    const ipoUpdates: MorningBrief['ipoUpdates'] = [];
    if (liveIpoResult.status === 'fulfilled') {
        for (const ipo of liveIpoResult.value) {
            ipoUpdates.push({
                name: ipo.name,
                status: 'Live',
                gmp: formatIpoGmp(ipo),
            });
        }
    }
    if (upcomingIpoResult.status === 'fulfilled') {
        for (const ipo of upcomingIpoResult.value.slice(0, 5)) {
            ipoUpdates.push({
                name: ipo.name,
                status: `Opens ${ipo.openDate ?? 'TBA'}`,
                gmp: formatIpoGmp(ipo),
            });
        }
    }

    // ─── Insider Trades (top 5 by share count) ──────────────────────
    const topInsiderTrades: MorningBrief['topInsiderTrades'] = [];
    if (insiderResult.status === 'fulfilled') {
        const sorted = [...insiderResult.value]
            .sort((a, b) => Math.abs(b.sharesAcquired) - Math.abs(a.sharesAcquired))
            .slice(0, 5);
        for (const t of sorted) {
            topInsiderTrades.push({
                company: t.company,
                person: t.personName,
                type: t.acquireMode,
                value: `${t.sharesAcquired.toLocaleString('en-IN')} shares`,
            });
        }
    }

    // ─── Bulk Deals (top 5 by value) ────────────────────────────────
    const topBulkDeals: MorningBrief['topBulkDeals'] = [];
    if (bulkResult.status === 'fulfilled') {
        for (const d of bulkResult.value.slice(0, 5)) {
            topBulkDeals.push({
                company: d.name,
                client: d.clientName,
                type: d.buySell,
                value: formatCr(d.valueCr),
            });
        }
    }

    // ─── Spikes ─────────────────────────────────────────────────────
    const spikesLast24h: MorningBrief['spikesLast24h'] =
        spikesResult.status === 'fulfilled' ? spikesResult.value : [];

    return {
        date: today,
        marketOverview,
        spikesLast24h,
        ipoUpdates,
        topInsiderTrades,
        topBulkDeals,
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function fetchRecentSpikes(): Promise<MorningBrief['spikesLast24h']> {
    try {
        const supabase = createAdminClient();
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('alerts')
            .select('ticker, mention_count, spike_mult')
            .gte('detected_at', since)
            .order('spike_mult', { ascending: false })
            .limit(10);

        if (error || !data) return [];

        return data.map(row => ({
            ticker: row.ticker,
            multiplier: row.spike_mult,
            mentions: row.mention_count,
        }));
    } catch {
        return [];
    }
}
