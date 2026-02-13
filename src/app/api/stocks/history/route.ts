
import { NextRequest, NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';

// Ticker to Token mapping (should use a central lookup service in prod)
// Reusing from stream route logic or simple map
const TICKER_MAP: Record<string, string> = {
    'RELIANCE': '2885',
    'TCS': '11536',
    'HDFCBANK': '1333',
    'INFY': '1594',
    'ITC': '1660'
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const range = searchParams.get('range') || '1D';

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    // Determine Interval and From/To Dates
    const now = new Date();
    let fromDate = new Date();
    let interval = 'ONE_DAY';

    switch (range) {
        case '1D':
            interval = 'ONE_MINUTE';
            // Start from 9:15 AM today. 
            fromDate.setHours(9, 15, 0, 0);
            if (now.getHours() < 9) {
                fromDate.setDate(fromDate.getDate() - 1);
            }
            break;
        case '1W':
            interval = 'FIVE_MINUTE';
            fromDate.setDate(now.getDate() - 7);
            break;
        case '1M':
            interval = 'FIFTEEN_MINUTE';
            fromDate.setDate(now.getDate() - 30);
            break;
        case '3M':
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 90);
            break;
        case '6M':
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 180);
            break;
        case '1Y':
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 365);
            break;
        case '5Y':
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 365 * 5);
            break;
        case 'ALL':
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 365 * 10);
            break;
        default:
            interval = 'ONE_DAY';
            fromDate.setDate(now.getDate() - 30);
    }

    // Format: YYYY-MM-DD HH:mm
    const formatDate = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    try {
        const instrument = await angelOne.findInstrument(ticker);
        if (!instrument) {
            return NextResponse.json({ error: `Instrument not found for ${ticker}` }, { status: 404 });
        }

        const response = await angelOne.getCandleData(
            instrument.exchange,
            instrument.token,
            interval,
            formatDate(fromDate),
            formatDate(now)
        );

        if (response && response.status && response.data) {
            // Transform data for Recharts
            // Angel One: [timestamp, open, high, low, close, volume]
            // Recharts expects: { date: '...', value: number }
            const history = response.data.map((item: any[]) => {
                const [timestamp, open, high, low, close, volume] = item;
                // Format timestamp for display
                let dateStr = timestamp;
                const d = new Date(timestamp);

                if (range === '1D') {
                    // 10:00 format
                    dateStr = `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
                } else if (range === '1W') {
                    // Mon, Tue or date
                    dateStr = d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
                } else {
                    // Date
                    dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }

                return {
                    date: dateStr,
                    value: close
                };
            });

            return NextResponse.json({
                ticker,
                range,
                history
            });
        }

        return NextResponse.json({ error: 'No data found', details: response }, { status: 404 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
