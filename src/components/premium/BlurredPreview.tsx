'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface BlurredPreviewProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export const BlurredPreview: React.FC<BlurredPreviewProps> = ({
    children,
    title = 'Premium Feature',
    description = 'Upgrade to Staqq Pro to unlock this feature',
    className = '',
}) => {
    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }} className={className}>
            {/* Blurred content */}
            <div
                style={{
                    filter: 'blur(8px)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.6,
                }}
            >
                {children}
            </div>

            {/* Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    background: 'rgba(10, 10, 10, 0.6)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(202, 255, 0, 0.15)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(202, 255, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Lock size={20} color="#CAFF00" />
                </div>
                <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', margin: '0 0 4px' }}>
                        {title}
                    </p>
                    <p style={{ color: '#A1A1AA', fontSize: '0.85rem', margin: 0 }}>
                        {description}
                    </p>
                </div>
                <Link
                    href="/pricing"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 20px',
                        borderRadius: '9999px',
                        background: '#CAFF00',
                        color: '#0A0A0A',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                    }}
                >
                    Upgrade to Pro
                </Link>
            </div>
        </div>
    );
};
