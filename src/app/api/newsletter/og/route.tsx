
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Load fonts (we need to load them to pass to ImageResponse)
    // In a real app, you might want to cache these or load them more efficiently
    const dmSansBold = await fetch(new URL('https://fonts.gstatic.com/s/dmsans/v11/rP2Cp2ywxg089UriASitCBimCw.ttf', import.meta.url)).then((res) => res.arrayBuffer());
    const dmSansRegular = await fetch(new URL('https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOihQ.ttf', import.meta.url)).then((res) => res.arrayBuffer());

    // Using a simpler font for the "Syne" font for now or loading it if possible
    // Syne ExtraBold
    const syneExtraBold = await fetch(new URL('https://fonts.gstatic.com/s/syne/v15/8vII7w402VwnP84S-3o.ttf', import.meta.url)).then((res) => res.arrayBuffer());

    if (type === 'market-alert') {
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #1a0000 0%, #110000 100%)',
                        border: '1px solid #3a0000',
                        borderRadius: '10px',
                        padding: '24px 32px', // increased padding for image scale
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        fontFamily: '"DM Sans"',
                    }}
                >
                    <div style={{ fontSize: '40px', marginRight: '24px' }}>🚨</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: '#ff4d4d',
                                marginBottom: '8px',
                            }}
                        >
                            Market Alert — RBI Policy Week
                        </div>
                        <div
                            style={{
                                fontSize: '26px',
                                color: '#cccccc',
                                lineHeight: 1.5,
                            }}
                        >
                            RBI held rates at 6.5% — <span style={{ color: '#ff4d4d', fontWeight: 700, marginLeft: '6px', marginRight: '6px' }}>surprising the market which expected a cut signal</span>.
                            Bond yields spiked 12bps. Watch banking stocks closely next week.
                        </div>
                    </div>
                </div>
            ),
            {
                width: 800, // Render at a larger width for high DPI
                height: 250,
                fonts: [
                    {
                        name: 'DM Sans',
                        data: dmSansBold,
                        style: 'normal',
                        weight: 700,
                    },
                    {
                        name: 'DM Sans',
                        data: dmSansRegular,
                        style: 'normal',
                        weight: 400,
                    },
                ],
            }
        );
    }

    if (type === 'number-of-week') {
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#111111',
                        border: '1px solid #1e1e1e',
                        borderRadius: '14px',
                        padding: '40px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: '"DM Sans"',
                    }}
                >
                    <div
                        style={{
                            fontFamily: '"Bebas Neue"', // We'd need to load this font too, sticking to sans-serif fallback for now if not loaded
                            fontSize: '160px',
                            color: '#CCFF00',
                            lineHeight: 1,
                            marginRight: '40px',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            fontWeight: 900, // simulating Bebas
                        }}
                    >
                        −14%
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontFamily: '"Syne"',
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: '#555555',
                                marginBottom: '12px',
                            }}
                        >
                            Infosys · YTD Return
                        </div>
                        <div
                            style={{
                                fontFamily: '"Syne"',
                                fontSize: '28px',
                                fontWeight: 800,
                                color: '#ffffff',
                                marginBottom: '16px',
                                lineHeight: 1.3,
                            }}
                        >
                            India's IT giants are in a slow bleed — and it's not stopping
                        </div>
                        <div
                            style={{
                                fontSize: '22px',
                                color: '#777777',
                                lineHeight: 1.65,
                            }}
                        >
                            Infosys closed at ₹1,369 this week, down 16% year-to-date. Wipro and TCS aren't far behind.
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1000,
                height: 400,
                fonts: [
                    {
                        name: 'DM Sans',
                        data: dmSansRegular,
                        style: 'normal',
                        weight: 400,
                    },
                    {
                        name: 'Syne',
                        data: syneExtraBold,
                        style: 'normal',
                        weight: 700,
                    },
                ],
            }
        );
    }

    return new Response('Invalid type', { status: 400 });
}
