import Link from 'next/link';

export default function NotFound() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: '8rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    margin: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'var(--font-outfit)',
                }}
            >
                404
            </h1>
            <p
                style={{
                    fontSize: '1.3rem',
                    color: '#fff',
                    fontWeight: 600,
                    margin: '16px 0 8px',
                }}
            >
                Page not found
            </p>
            <p
                style={{
                    fontSize: '0.95rem',
                    color: '#888',
                    maxWidth: '400px',
                    marginBottom: '32px',
                }}
            >
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                    }}
                >
                    Go Home
                </Link>
                <Link
                    href="/ipo"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                    }}
                >
                    IPO Hub
                </Link>
            </div>
        </main>
    );
}
