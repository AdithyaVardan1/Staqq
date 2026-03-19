import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// OG image for individual IPO pages
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || 'IPO';
    const price = searchParams.get('price') || '';
    const gmp = searchParams.get('gmp') || '';
    const gmpPct = searchParams.get('gmpPct') || '';
    const sub = searchParams.get('sub') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || 'IPO';
    const sentiment = searchParams.get('sentiment') || 'neutral';

    const sentimentColors: Record<string, string> = {
        strong_positive: '#22c55e',
        positive: '#4ade80',
        neutral: '#f59e0b',
        negative: '#f87171',
        strong_negative: '#ef4444',
    };

    const accentColor = sentimentColors[sentiment] || '#6366f1';
    const gmpNum = parseFloat(gmpPct);
    const isPositive = !isNaN(gmpNum) && gmpNum >= 0;

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
                {/* Background glow matching sentiment */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-150px',
                        right: '-150px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-100px',
                        left: '-100px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
                        display: 'flex',
                    }}
                />

                {/* Top bar: brand + status */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '40px',
                    }}
                >
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
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {status && (
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: status === 'Live' ? '#22c55e' : status === 'Upcoming' ? '#f59e0b' : '#888',
                                    background: status === 'Live' ? 'rgba(34,197,94,0.15)' : status === 'Upcoming' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {status}
                            </span>
                        )}
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#888',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '6px 14px',
                                borderRadius: '6px',
                            }}
                        >
                            {category}
                        </span>
                    </div>
                </div>

                {/* IPO Name */}
                <h1
                    style={{
                        fontSize: name.length > 35 ? '44px' : '56px',
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        margin: 0,
                        marginBottom: '8px',
                    }}
                >
                    {name}
                </h1>
                <p
                    style={{
                        fontSize: '20px',
                        color: 'rgba(255,255,255,0.4)',
                        margin: 0,
                        marginBottom: '40px',
                    }}
                >
                    IPO Intelligence & GMP Analysis
                </p>

                {/* GMP highlight */}
                {gmpPct && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '16px',
                            marginBottom: '40px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '72px',
                                fontWeight: 800,
                                color: accentColor,
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                            }}
                        >
                            {isPositive ? '+' : ''}{gmpPct}%
                        </span>
                        <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                            GMP
                        </span>
                    </div>
                )}

                {/* Stats grid */}
                <div
                    style={{
                        display: 'flex',
                        gap: '40px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '30px',
                        marginTop: 'auto',
                    }}
                >
                    {price && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Issue Price</span>
                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>₹{price}</span>
                        </div>
                    )}
                    {gmp && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>GMP</span>
                            <span style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>₹{gmp}</span>
                        </div>
                    )}
                    {sub && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Subscription</span>
                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{sub}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>staqq.com</span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
