import { NextRequest } from 'next/server';
import { angelOne } from '@/lib/angelone';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tickersStr = searchParams.get('tickers') || searchParams.get('ticker');

    if (!tickersStr) {
        return new Response('Tickers required', { status: 400 });
    }

    const tickers = tickersStr.split(',').map(t => t.trim());
    const tokenMap = new Map<string, string>(); // token -> ticker
    const nseTokens: string[] = [];
    const bseTokens: string[] = [];

    // Resolve all tokens and group by exchange
    const missedTickers: string[] = [];
    for (const ticker of tickers) {
        const instrument = await angelOne.findInstrument(ticker);
        if (instrument) {
            tokenMap.set(String(instrument.token), ticker);
            if (instrument.exchange === 'NSE') {
                nseTokens.push(String(instrument.token));
            } else if (instrument.exchange === 'BSE') {
                bseTokens.push(String(instrument.token));
            }
        } else {
            missedTickers.push(ticker);
        }
    }

    if (missedTickers.length > 0) {
        console.warn(`[SSE] Could not resolve tokens for: ${missedTickers.join(', ')}`);
    }

    if (nseTokens.length === 0 && bseTokens.length === 0) {
        return new Response('No valid tokens found', { status: 404 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            let ws: any = null;
            let isClosed = false;

            const safeEnqueue = (data: string) => {
                if (!isClosed) {
                    try {
                        controller.enqueue(encoder.encode(data));
                    } catch (e) {
                        isClosed = true;
                    }
                }
            };

            const cleanup = () => {
                isClosed = true;
                if (ws) {
                    try { ws.close(); } catch (e) { }
                }
            };

            try {
                ws = await angelOne.getWebSocketV2();

                ws.connect().then(() => {
                    safeEnqueue(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

                    // Subscribe to NSE tokens
                    if (nseTokens.length > 0) {
                        ws.fetchData({
                            action: 1, // Subscribe
                            mode: 1, // LTP
                            exchangeType: 1, // NSE
                            tokens: nseTokens
                        });
                    }

                    // Subscribe to BSE tokens
                    if (bseTokens.length > 0) {
                        ws.fetchData({
                            action: 1, // Subscribe
                            mode: 1, // LTP
                            exchangeType: 3, // BSE
                            tokens: bseTokens
                        });
                    }
                }).catch((err: any) => {
                    console.error('[SSE] WS Connect Error:', err);
                    cleanup();
                    try { controller.close(); } catch (e) { }
                });

                ws.on('tick', (tick: any) => {
                    if (!isClosed && tick && tick.last_traded_price) {
                        const ticker = tokenMap.get(String(tick.token));
                        if (ticker) {
                            const price = parseFloat(tick.last_traded_price) / 100;
                            const payload = JSON.stringify({
                                ticker,
                                price,
                                timestamp: tick.exchange_timestamp
                            });
                            safeEnqueue(`data: ${payload}\n\n`);
                        }
                    }
                });

                const interval = setInterval(() => {
                    if (!isClosed) safeEnqueue(': heartbeat\n\n');
                    else clearInterval(interval);
                }, 15000);

                req.signal.addEventListener('abort', () => {
                    clearInterval(interval);
                    cleanup();
                    try { controller.close(); } catch (e) { }
                });

            } catch (error: any) {
                console.error('[SSE] Fatal Error:', error);
                cleanup();
                if (!isClosed) controller.error(error);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
