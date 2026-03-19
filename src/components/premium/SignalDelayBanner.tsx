'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export const SignalDelayBanner: React.FC = () => {
    const { isFree, loading } = useSubscription();

    if (loading || !isFree) return null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: '0.85rem',
                color: '#F59E0B',
                marginBottom: '16px',
            }}
        >
            <Clock size={14} />
            <span>Signals delayed 30 min on free tier.</span>
            <Link
                href="/pricing"
                style={{
                    color: '#CAFF00',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginLeft: '4px',
                }}
            >
                Upgrade for real-time →
            </Link>
        </div>
    );
};
