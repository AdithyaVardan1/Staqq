import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Default OG image for homepage / generic shares
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Staqq';
    const subtitle = searchParams.get('subtitle') || 'IPO Intelligence & Market Signals for Indian Investors';
    const stat1Label = searchParams.get('s1l') || '';
    const stat1Value = searchParams.get('s1v') || '';
    const stat2Label = searchParams.get('s2l') || '';
    const stat2Value = searchParams.get('s2v') || '';
    const stat3Label = searchParams.get('s3l') || '';
    const stat3Value = searchParams.get('s3v') || '';

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
                {/* Background grid pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                        display: 'flex',
                    }}
                />

                {/* Accent glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />

                {/* Logo / Brand */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '40px',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            fontWeight: 800,
                            color: '#fff',
                        }}
                    >
                        S
                    </div>
                    <span
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        staqq
                    </span>
                </div>

                {/* Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                    }}
                >
                    <h1
                        style={{
                            fontSize: title.length > 30 ? '52px' : '64px',
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            margin: 0,
                        }}
                    >
                        {title}
                    </h1>
                    <p
                        style={{
                            fontSize: '24px',
                            color: 'rgba(255,255,255,0.5)',
                            marginTop: '16px',
                            lineHeight: 1.4,
                        }}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Stats row */}
                {stat1Label && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '40px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '30px',
                        }}
                    >
                        {[
                            { label: stat1Label, value: stat1Value },
                            { label: stat2Label, value: stat2Value },
                            { label: stat3Label, value: stat3Value },
                        ]
                            .filter(s => s.label)
                            .map((stat) => (
                                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                        {stat.label}
                                    </span>
                                    <span style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '20px',
                    }}
                >
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>
                        staqq.in
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
