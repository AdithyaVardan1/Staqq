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

    // Resolve all tokens
    for (const ticker of tickers) {
        const token = await angelOne.findToken(ticker);
        if (token) {
            tokenMap.set(String(token), ticker);
            console.log(`[SSE] Resolved ${ticker} -> ${token}`);
        } else {
            console.warn(`[SSE] Could not resolve token for ${ticker}`);
        }
    }

    if (tokenMap.size === 0) {
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

                    // Subscribe to all tickers in one go
                    ws.fetchData({
                        action: 1, // Subscribe
                        mode: 1, // LTP
                        exchangeType: 1, // NSE
                        tokens: Array.from(tokenMap.keys())
                    });
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
                            console.log(`[SSE] Tick for ${ticker}: ${price} (raw: ${tick.last_traded_price})`);
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
