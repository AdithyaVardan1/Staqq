import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, BarChart3, Award, Users } from 'lucide-react';
import type { CategoryStats } from '@/lib/ipoAnalytics';

interface IPOPerformanceStatsProps {
    allStats: CategoryStats;
    mainboardStats: CategoryStats;
    smeStats: CategoryStats;
}

export const IPOPerformanceStats: React.FC<IPOPerformanceStatsProps> = ({
    allStats,
    mainboardStats,
    smeStats,
}) => {
    const positiveRate = allStats.withGmp > 0
        ? Math.round((allStats.positiveGmp / allStats.withGmp) * 100)
        : 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Overall Sentiment */}
            <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <BarChart3 size={18} style={{ color: 'var(--primary-brand)' }} />
                    <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                        GMP Sentiment
                    </span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: positiveRate >= 50 ? '#22c55e' : '#f87171' }}>
                    {positiveRate}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    IPOs with positive GMP
                </div>
            </Card>

            {/* Avg GMP */}
            <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    {allStats.avgGmpPercent >= 0
                        ? <TrendingUp size={18} style={{ color: '#22c55e' }} />
                        : <TrendingDown size={18} style={{ color: '#ef4444' }} />
                    }
                    <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                        Avg GMP
                    </span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: allStats.avgGmpPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                    {allStats.avgGmpPercent >= 0 ? '+' : ''}{allStats.avgGmpPercent}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    Across {allStats.withGmp} IPOs
                </div>
            </Card>

            {/* Top GMP */}
            {allStats.highestGmp && (
                <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Award size={18} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                            Highest GMP
                        </span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: '#22c55e' }}>
                        +{allStats.highestGmp.gmpPercent}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {allStats.highestGmp.name}
                    </div>
                </Card>
            )}

            {/* Most Subscribed */}
            {allStats.mostSubscribed && (
                <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Users size={18} style={{ color: 'var(--primary-brand)' }} />
                        <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                            Most Subscribed
                        </span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: 'var(--primary-brand)' }}>
                        {allStats.mostSubscribed.subscriptionNum}x
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {allStats.mostSubscribed.name}
                    </div>
                </Card>
            )}

            {/* Mainboard vs SME */}
            <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Mainboard vs SME
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>
                            {mainboardStats.total}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>Mainboard</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>
                            {smeStats.total}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>SME</div>
                    </div>
                </div>
            </Card>

            {/* Avg Subscription */}
            <Card style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Avg Subscription
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: 'var(--primary-brand)' }}>
                            {mainboardStats.avgSubscription}x
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>Mainboard</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', color: 'var(--primary-brand)' }}>
                            {smeStats.avgSubscription}x
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>SME</div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
