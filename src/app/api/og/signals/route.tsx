import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// OG image for signal pages (FII/DII, insider trades, bulk deals, social)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'market';
    const title = searchParams.get('title') || 'Market Signals';
    const value = searchParams.get('value') || '';
    const direction = searchParams.get('direction') || 'neutral'; // bullish, bearish, neutral
    const detail1 = searchParams.get('d1') || '';
    const detail2 = searchParams.get('d2') || '';
    const detail3 = searchParams.get('d3') || '';
    const date = searchParams.get('date') || new Date().toLocaleDateString('en-IN');

    const directionColors: Record<string, string> = {
        bullish: '#22c55e',
        bearish: '#ef4444',
        neutral: '#f59e0b',
    };

    const typeLabels: Record<string, string> = {
        'fii-dii': 'FII/DII FLOWS',
        'insider-trades': 'INSIDER TRADES',
        'bulk-deals': 'BULK DEALS',
        'social': 'SOCIAL SENTIMENT',
        'market': 'MARKET SIGNALS',
    };

    const accentColor = directionColors[direction] || '#6366f1';

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
                {/* Background accent */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-200px',
                        right: '-100px',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
                        display: 'flex',
                    }}
                />

                {/* Top bar */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '36px',
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
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: accentColor,
                                background: `${accentColor}18`,
                                padding: '6px 14px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            {typeLabels[type] || type.toUpperCase()}
                        </span>
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#666',
                            }}
                        >
                            {date}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontSize: '52px',
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        margin: 0,
                        marginBottom: '12px',
                    }}
                >
                    {title}
                </h1>

                {/* Big value */}
                {value && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginTop: '20px',
                            marginBottom: '20px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '80px',
                                fontWeight: 800,
                                color: accentColor,
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                            }}
                        >
                            {value}
                        </span>
                    </div>
                )}

                {/* Details */}
                <div
                    style={{
                        display: 'flex',
                        gap: '40px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '28px',
                        marginTop: 'auto',
                    }}
                >
                    {[detail1, detail2, detail3].filter(Boolean).map((detail, i) => {
                        const [label, val] = detail.split(':');
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    {label}
                                </span>
                                <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                                    {val || ''}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>staqq.in</span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
