import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CACHE_TTL: Record<string, number> = {
    '1D': 300,
    '1W': 900,
    '1M': 3600,
    '3M': 3600,
    '6M': 86400,
    '1Y': 86400,
    '5Y': 86400,
    'ALL': 86400,
};

function getPeriod1(range: string): Date {
    const d = new Date();
    switch (range) {
        case '1D':  d.setDate(d.getDate() - 1);   break;
        case '1W':  d.setDate(d.getDate() - 7);   break;
        case '1M':  d.setMonth(d.getMonth() - 1); break;
        case '3M':  d.setMonth(d.getMonth() - 3); break;
        case '6M':  d.setMonth(d.getMonth() - 6); break;
        case '1Y':  d.setFullYear(d.getFullYear() - 1); break;
        case '5Y':  d.setFullYear(d.getFullYear() - 5); break;
        case 'ALL': d.setFullYear(d.getFullYear() - 20); break;
        default:    d.setMonth(d.getMonth() - 1);
    }
    return d;
}

function getInterval(range: string): string {
    switch (range) {
        case '1D': return '5m';
        case '1W': return '30m';
        case '1M': return '1d';
        case '3M': return '1d';
        case '6M': return '1d';
        case '1Y': return '1wk';
        case '5Y': return '1mo';
        case 'ALL': return '3mo';
        default: return '1d';
    }
}

function formatLabel(d: Date, range: string): string {
    if (range === '1D') return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (range === '1W') return d.toLocaleDateString('en-IN', { weekday: 'short', hour: 'numeric' });
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const range = searchParams.get('range') || '1M';

    if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

    const cacheKey = `history:${ticker}:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        try { return NextResponse.json(JSON.parse(cached)); } catch { /* fall through */ }
    }

    try {
        const YahooFinance: any = (await import('yahoo-finance2')).default;
        const yf = new YahooFinance();

        const result = await yf.chart(`${ticker}.NS`, {
            period1: getPeriod1(range),
            interval: getInterval(range),
        });

        const quotes: any[] = result?.quotes || [];
        const history = quotes
            .filter((q: any) => q.close != null)
            .map((q: any) => ({
                date: formatLabel(new Date(q.date), range),
                value: parseFloat(q.close.toFixed(2)),
            }));

        if (history.length === 0) {
            return NextResponse.json({ error: 'No data' }, { status: 404 });
        }

        const payload = { ticker, range, history };
        await redis.set(cacheKey, JSON.stringify(payload), CACHE_TTL[range] ?? 3600);
        return NextResponse.json(payload);

    } catch (error: any) {
        console.error('[History]', ticker, range, error.message);
        return NextResponse.json({ error: 'History unavailable' }, { status: 500 });
    }
}
