'use client';

import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showIcon?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
    size = 'sm',
    className = '',
    showIcon = true,
}) => {
    const sizeStyles = {
        sm: { fontSize: '0.65rem', padding: '2px 6px', gap: '3px', iconSize: 10 },
        md: { fontSize: '0.75rem', padding: '3px 8px', gap: '4px', iconSize: 12 },
        lg: { fontSize: '0.85rem', padding: '4px 10px', gap: '5px', iconSize: 14 },
    };

    const s = sizeStyles[size];

    return (
        <span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: s.gap,
                fontSize: s.fontSize,
                fontWeight: 700,
                padding: s.padding,
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #CAFF00 0%, #a8d600 100%)',
                color: '#0A0A0A',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                lineHeight: 1,
                whiteSpace: 'nowrap',
            }}
        >
            {showIcon && <Crown size={s.iconSize} strokeWidth={2.5} />}
            PRO
        </span>
    );
};
