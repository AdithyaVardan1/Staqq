'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[App Error]', error);
    }, [error]);

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
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '24px',
                }}
            >
                !
            </div>
            <h2
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 8px',
                }}
            >
                Something went wrong
            </h2>
            <p
                style={{
                    fontSize: '0.95rem',
                    color: '#888',
                    maxWidth: '400px',
                    marginBottom: '24px',
                }}
            >
                An unexpected error occurred. This has been logged automatically.
            </p>
            <button
                onClick={reset}
                style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                }}
            >
                Try again
            </button>
        </main>
    );
}
