import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getGmpSentiment } from '@/lib/ipoAnalytics';

interface GmpSentimentBadgeProps {
    gmpPercent: number | null;
    size?: 'sm' | 'md';
}

export const GmpSentimentBadge: React.FC<GmpSentimentBadgeProps> = ({ gmpPercent, size = 'sm' }) => {
    const { sentiment, label, color } = getGmpSentiment(gmpPercent);

    const iconSize = size === 'sm' ? 12 : 14;
    const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';
    const padding = size === 'sm' ? '2px 8px' : '4px 10px';

    const Icon = sentiment.includes('positive') ? TrendingUp
        : sentiment.includes('negative') ? TrendingDown
        : Minus;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize,
                fontWeight: 600,
                color,
                background: `${color}15`,
                border: `1px solid ${color}30`,
                borderRadius: '6px',
                padding,
                whiteSpace: 'nowrap',
            }}
        >
            <Icon size={iconSize} />
            {label}
        </span>
    );
};
