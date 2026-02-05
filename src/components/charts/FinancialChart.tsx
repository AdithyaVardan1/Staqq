
'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import styles from './FinancialChart.module.css';

interface DataPoint {
    date: string;
    value: number;
}

interface FinancialChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
    showGrid?: boolean;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
    data,
    color = '#CCFF00',
    height = 300,
    showGrid = true
}) => {
    return (
        <div className={styles.container} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {/* Minimalist Design: No Grid */}
                    {/* {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />} */}

                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fontSize: 10, fill: '#666' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />

                    <YAxis
                        domain={['dataMin', 'dataMax']} /* Force dynamic scaling */
                        hide={true} /* Hide axis labels completely like Groww */
                    />

                    <Tooltip
                        contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value: any) => [`₹${value}`, 'Price']}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
