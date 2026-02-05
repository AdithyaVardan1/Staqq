import { NextRequest, NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    try {
        const token = await angelOne.findToken(ticker);
        if (!token) {
            return NextResponse.json({ error: `Token not found for ${ticker}` }, { status: 404 });
        }

        const symbol = `${ticker}-EQ`;
        const quote = await angelOne.getFullQuote('NSE', symbol, String(token));

        if (quote && quote.status && quote.data && quote.data.length > 0) {
            const data = quote.data[0];
            return NextResponse.json({
                ticker,
                price: parseFloat(data.ltp),
                change: parseFloat(data.netChange),
                changePercent: parseFloat(data.percentChange),
                exchange: data.exchange,
                tradingSymbol: data.tradingsymbol
            });
        }

        return NextResponse.json({ error: 'Failed to fetch price from Angel One' }, { status: 500 });

    } catch (error: any) {
        console.error('[API/Price] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
