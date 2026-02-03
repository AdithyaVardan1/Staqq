"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import styles from "./ChartExample.module.css";

interface ChartExampleProps {
    type?: "compound" | "comparison" | "custom";
    initialAmount?: number;
    years?: number;
    rate?: number;
    data?: { name: string; value: number }[];
    title?: string;
}

// Generate compound interest data
function generateCompoundData(principal: number, years: number, rate: number) {
    const data = [];
    for (let year = 0; year <= years; year++) {
        const amount = principal * 12 * year; // Total invested
        const compounded = calculateFutureValue(principal, rate / 100, year);
        data.push({
            year: `Year ${year}`,
            invested: Math.round(amount),
            value: Math.round(compounded),
        });
    }
    return data;
}

function calculateFutureValue(
    monthlyPayment: number,
    annualRate: number,
    years: number
): number {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyPayment * months;
    return (
        monthlyPayment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate)
    );
}

export function ChartExample({
    type = "compound",
    initialAmount = 20000,
    years = 20,
    rate = 12,
    title,
    data,
}: ChartExampleProps) {
    const chartData = data || generateCompoundData(initialAmount, years, rate);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
        return `₹${value}`;
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.header}>
                <span className={styles.icon}>📈</span>
                <span className={styles.title}>
                    {title || `Compound Growth: ₹${initialAmount.toLocaleString()}/month at ${rate}%`}
                </span>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3a5a" />
                        <XAxis
                            dataKey="year"
                            stroke="#6b7280"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#e5e7eb",
                            }}
                            formatter={(value: any, name: any) => [
                                formatCurrency(value),
                                name === "value" ? "Total Value" : "Invested",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="invested"
                            stroke="#3b82f6"
                            fill="url(#colorInvested)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="url(#colorValue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: "#3b82f6" }}></span>
                    <span>Total Invested</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: "#8b5cf6" }}></span>
                    <span>Portfolio Value</span>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Invested</span>
                    <span className={styles.statValue}>
                        {formatCurrency(initialAmount * 12 * years)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Final Value</span>
                    <span className={styles.statValue} style={{ color: "#22c55e" }}>
                        {formatCurrency(chartData[chartData.length - 1]?.value || 0)}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Wealth Gain</span>
                    <span className={styles.statValue} style={{ color: "#fbbf24" }}>
                        {formatCurrency((chartData[chartData.length - 1]?.value || 0) - initialAmount * 12 * years)}
                    </span>
                </div>
            </div>
        </div>
    );
}
