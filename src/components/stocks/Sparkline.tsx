
'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface SparklineProps {
    data: number[];
    isPositive: boolean;
    height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    isPositive,
    height = 40
}) => {
    // Transform simple number array to recharts format
    const chartData = data.map((val, i) => ({ val, i }));
    const color = isPositive ? '#22C55E' : '#EF4444';

    return (
        <div style={{ width: '100%', height: height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill={`url(#gradient-${isPositive})`}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
