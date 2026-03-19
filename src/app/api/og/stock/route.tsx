import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// OG image for individual stock pages
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker') || 'STOCK';
    const name = searchParams.get('name') || '';
    const price = searchParams.get('price') || '';
    const change = searchParams.get('change') || '';
    const changePct = searchParams.get('changePct') || '';
    const mcap = searchParams.get('mcap') || '';
    const pe = searchParams.get('pe') || '';
    const sector = searchParams.get('sector') || '';

    const changeNum = parseFloat(changePct);
    const isPositive = !isNaN(changeNum) && changeNum >= 0;
    const accentColor = isPositive ? '#22c55e' : '#ef4444';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
                    padding: '60px',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-150px',
                        right: '-100px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
                        display: 'flex',
                    }}
                />

                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 800,
                                color: '#fff',
                            }}
                        >
                            S
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>staqq</span>
                    </div>
                    {sector && (
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#888', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '6px' }}>
                            {sector}
                        </span>
                    )}
                </div>

                {/* Ticker & name */}
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                    <h1
                        style={{
                            fontSize: '68px',
                            fontWeight: 800,
                            color: '#fff',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                            margin: 0,
                        }}
                    >
                        {ticker}
                    </h1>
                    {name && (
                        <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: '8px' }}>
                            {name}
                        </p>
                    )}
                </div>

                {/* Price & change */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginTop: '16px', marginBottom: 'auto' }}>
                    {price && (
                        <span style={{ fontSize: '56px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                            ₹{price}
                        </span>
                    )}
                    {changePct && (
                        <span style={{ fontSize: '32px', fontWeight: 700, color: accentColor }}>
                            {isPositive ? '+' : ''}{changePct}%
                        </span>
                    )}
                    {change && (
                        <span style={{ fontSize: '24px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                            ({isPositive ? '+' : ''}₹{change})
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '50px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '28px' }}>
                    {mcap && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Market Cap</span>
                            <span style={{ fontSize: '26px', fontWeight: 700, color: '#fff' }}>{mcap}</span>
                        </div>
                    )}
                    {pe && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>P/E Ratio</span>
                            <span style={{ fontSize: '26px', fontWeight: 700, color: '#fff' }}>{pe}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>staqq.com</span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
