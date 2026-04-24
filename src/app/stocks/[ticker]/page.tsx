
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FinancialChart } from '@/components/charts/FinancialChart';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Plus,
    Share2,
    ExternalLink,
    Briefcase,
    Search,
    Bookmark,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { use } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { StockLogo } from '@/components/stocks/StockLogo';
import { AlertSubscribeButton } from '@/components/alerts/AlertSubscribeButton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import styles from './page.module.css';

import { useLiveMarketData } from '@/hooks/useLiveMarketData';

interface FundamentalData {
    ticker: string;
    description: string;
    sector: string;
    industry: string;
    marketCap: number;
    peRatio: number;
    pegRatio: number;
    pbRatio: number;
    beta: number;
    divYield: number;
    netMargin: number;
    roe: number;
    roa: number;
    eps: number;
    high52: number;
    low52: number;
    debtToEquity: number;
    website: string;
    financials: {
        quarterly: {
            period: string;
            revenue: number;
            profit: number;
            eps: number;
        }[];
        annual: {
            year: string;
            revenue: number;
            profit: number;
            eps: number;
        }[];
    };
}

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const ticker = resolvedParams.ticker?.toUpperCase() || '';

    // Initial dynamic state before fundamentals load
    const [data, setData] = useState({
        ticker: ticker,
        fullTicker: ticker.includes('.') ? ticker : `${ticker}.NS`,
        name: ticker,
        price: 0,
        change: 0,
        changePercent: 0,
        about: "Loading stock information...",
        sector: "---",
        industry: "---",
        founded: "---",
        website: "---",
        stats: [],
        metrics: {
            valuation: [],
            profitability: [],
            leverage: []
        },
        financials: {
            quarterly: [],
            annual: []
        },
        news: [],
        events: [],
        shareholding: [
            { name: 'Promoters', value: 50.1, color: '#22C55E' },
            { name: 'FII', value: 23.4, color: '#3B82F6' },
            { name: 'DII', value: 14.2, color: '#8B5CF6' },
            { name: 'Public', value: 12.3, color: '#F59E0B' },
        ],
        technicals: [
            { name: 'RSI (14)', value: '55.4', status: 'Neutral', interpretation: 'Market is in a balanced state.' },
            { name: 'MACD', value: '+12.5', status: 'Bullish', interpretation: 'Short-term momentum is positive.' },
            { name: 'Moving Average', value: 'Above 200DMA', status: 'Bullish', interpretation: 'Long-term trend is upward.' }
        ]
    });

    const [timeframe, setTimeframe] = useState('1D');
    const [fundamentals, setFundamentals] = useState<any | null>(null);
    const [isLoadingFundamentals, setIsLoadingFundamentals] = useState(true);
    const [fundamentalsError, setFundamentalsError] = useState<string | null>(null);
    const [lookupLimitHit, setLookupLimitHit] = useState(false);
    const [dataSource, setDataSource] = useState<'yfinance' | 'yfinance-python' | 'mock-fallback' | null>(null);

    // Financial chart state
    const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit'>('revenue');
    const [activePeriod, setActivePeriod] = useState<'quarterly' | 'yearly'>('quarterly');
    const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
    const isWatched = isInWatchlist(data.ticker);

    const [showDetails, setShowDetails] = useState(false);

    const handleWatchlistToggle = () => {
        if (isWatched) {
            removeFromWatchlist(data.ticker);
        } else {
            addToWatchlist(data.ticker);
        }
    };

    const { price: displayPrice, change: liveChange, changePercent: liveChangePercent, status } = useLiveMarketData(ticker, data.price);

    // Use live values if they exist, otherwise fallback to initial data
    const currentChangeAmount = liveChange !== undefined ? liveChange : data.change;
    const currentChangePercent = liveChangePercent !== undefined ? liveChangePercent : data.changePercent;

    const isPositive = currentChangePercent >= 0;

    const [historicalChartData, setHistoricalChartData] = useState<any[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(false);

    // Track "Recently Viewed" and "Trending"
    useEffect(() => {
        if (ticker) {
            fetch('/api/user/recently-viewed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            }).catch(e => console.error('Failed to track view:', e));
        }
    }, [ticker]);

    // Fetch Fundamentals from Yahoo Finance
    React.useEffect(() => {
        const fetchFundamentals = async () => {
            setIsLoadingFundamentals(true);
            setFundamentalsError(null);
            try {
                console.log(`[StockDetail] Fetching fundamentals for: ${ticker}`);
                const res = await fetch(`/api/stocks/fundamentals?ticker=${ticker}`);

                if (!res.ok) {
                    if (res.status === 429) {
                        setLookupLimitHit(true);
                        setIsLoadingFundamentals(false);
                        return;
                    }
                    const errorText = await res.text();
                    console.error(`[StockDetail] API Error (${res.status}):`, errorText);
                    throw new Error(`API returned ${res.status}: ${errorText}`);
                }

                const result = await res.json();
                console.log(`[StockDetail] API Response:`, result);

                if (result.fundamentals) {
                    const f = result.fundamentals;
                    setFundamentals(f);
                    setDataSource(result.source || 'yfinance-python');

                    // Update main data state with fresh info
                    setData(prev => ({
                        ...prev,
                        name: f.name || prev.name,
                        about: f.description || prev.about,
                        sector: f.sector || prev.sector,
                        industry: f.industry || prev.industry,
                        website: f.website || prev.website,
                        financials: f.financials || prev.financials,
                        events: (f.events || []).map((e: any, idx: number) => ({
                            ...e,
                            id: e.id || `event-${idx}`
                        })),
                        news: (f.news || []).map((n: any, idx: number) => ({
                            id: n.id || `news-${idx}`,
                            title: n.title || '',
                            source: n.source || 'Market News',
                            link: n.link || '',
                            date: n.date || 'Recent'
                        })),
                        shareholding: f.shareholding || prev.shareholding,
                        technicals: f.technicals || prev.technicals
                    }));

                    console.log(`[StockDetail] Loaded fundamentals for ${ticker}:`, f);
                } else {
                    setFundamentalsError(result.error || 'Failed to fetch fundamentals');
                }
            } catch (error: any) {
                console.error('[StockDetail] Failed to fetch fundamentals:', error);
                setFundamentalsError(`Network error: ${error.message}`);
            } finally {
                setIsLoadingFundamentals(false);
            }
        };

        fetchFundamentals();
    }, [ticker]);

    // Fetch Historical Data
    React.useEffect(() => {
        const fetchHistory = async () => {
            setIsLoadingChart(true);
            try {
                const res = await fetch(`/api/stocks/history?ticker=${ticker}&range=${timeframe}`);
                const history = await res.json();
                if (history.history) {
                    setHistoricalChartData(history.history);
                } else {
                    // Fallback to mock if API fails? Or just empty
                    // setHistoricalChartData(data.history[timeframe] || []); // removed fallback to force API verification
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoadingChart(false);
            }
        };

        fetchHistory();
    }, [ticker, timeframe]);


    // Helper functions to format Yahoo Finance data
    const formatMarketCap = (marketCap: number) => {
        if (marketCap >= 1e12) return `₹${(marketCap / 1e12).toFixed(1)}T`;
        if (marketCap >= 1e9) return `₹${(marketCap / 1e9).toFixed(1)}B`;
        if (marketCap >= 1e7) return `₹${(marketCap / 1e7).toFixed(0)}Cr`;
        return `₹${marketCap.toLocaleString()}`;
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(2)}%`;
    };

    const formatRatio = (value: number) => {
        return value ? value.toFixed(2) : 'N/A';
    };

    // Generate real-time stats from fundamentals
    // Generate real-time stats from fundamentals
    const getRealStats = () => {
        if (!fundamentals) return data.stats;

        return [
            { label: 'Market Cap', value: formatMarketCap(fundamentals.marketCap) },
            { label: '52-Week High', value: `₹${fundamentals.high52?.toFixed(2) || '--'}` },
            { label: '52-Week Low', value: `₹${fundamentals.low52?.toFixed(2) || '--'}` },
            { label: 'P/E Ratio', value: formatRatio(fundamentals.peRatio) },
            { label: 'Div Yield', value: formatPercentage(fundamentals.divYield) },
            { label: 'Beta', value: formatRatio(fundamentals.beta) },
            { label: 'Source', value: 'yFinance' },
        ];
    };

    // Get company info from fundamentals
    const getCompanyInfo = () => {
        if (!fundamentals) return {
            name: data.name,
            about: data.about,
            sector: data.sector,
            industry: data.industry,
            website: data.website,
            founded: data.founded
        };

        return {
            name: fundamentals.name || ticker,
            about: fundamentals.description || "No description available.",
            sector: fundamentals.sector || "N/A",
            industry: fundamentals.industry || "N/A",
            website: fundamentals.website || "N/A",
            founded: "---"
        };
    };

    const stats = getRealStats();
    const companyInfo = getCompanyInfo();

    // Helper functions for chart data
    const getChartData = () => {
        const sourceData = activePeriod === 'quarterly'
            ? fundamentals?.financials?.quarterly
            : fundamentals?.financials?.annual;

        if (sourceData && sourceData.length > 0) {
            return [...sourceData].reverse().map(item => ({
                ...item,
                period: 'period' in item ? item.period : (item as any).year,
            }));
        }

        return [];
    };

    const getMetricConfig = () => {
        const configs = {
            revenue: {
                dataKey: 'revenue',
                name: 'Revenue',
                color: '#22C55E',
                unit: 'Cr',
                formatter: (value: number) => `₹${value.toLocaleString('en-IN')} Cr`
            },
            profit: {
                dataKey: 'profit',
                name: 'Net Profit',
                color: '#3B82F6',
                unit: 'Cr',
                formatter: (value: number) => `₹${value.toLocaleString('en-IN')} Cr`
            }
        };
        return configs[activeMetric];
    };

    const chartData = getChartData();
    const metricConfig = getMetricConfig();

    return (
        <main className={styles.main}>
            <div className="container">
                {/* Back Link & Info Header */}
                <div className={styles.navBar}>
                    <Link href="/stocks/screener" className={styles.backLink}>
                        <ArrowLeft size={18} /> Screener
                    </Link>
                    <div className={styles.actions}>
                        <Button variant="ghost" size="icon"><Share2 size={20} /></Button>
                        <Button
                            variant={isWatched ? "primary" : "outline"}
                            size="sm"
                            className={styles.watchlistBtn}
                            onClick={handleWatchlistToggle}
                        >
                            <Bookmark size={18} fill={isWatched ? "currentColor" : "none"} />
                            {isWatched ? 'In Watchlist' : 'Watchlist'}
                        </Button>
                        <AlertSubscribeButton ticker={data.ticker} />
                    </div>
                </div>

                {/* Lookup limit banner */}
                {lookupLimitHit && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        fontSize: '0.9rem',
                        color: '#F59E0B',
                        marginBottom: '20px',
                    }}>
                        <span>You have used all 5 free stock lookups for today.</span>
                        <Link
                            href="/signup"
                            style={{ color: '#CAFF00', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Sign up free for more
                        </Link>
                    </div>
                )}

                {/* Stock Header Section */}
                <section className={styles.headerSection}>
                    <div className={styles.lhs}>
                        <div className={styles.logoAndTitle}>
                            <StockLogo ticker={data.ticker} name={companyInfo.name} size="md" />
                            <div>
                                <h1 className={styles.title}>{companyInfo.name} ({data.ticker})</h1>
                                <div className={styles.tickerRow}>
                                    <Badge variant="neutral" className={styles.tickerBadge}>{data.fullTicker}</Badge>
                                    <span className="text-secondary text-sm font-medium">{companyInfo.sector} • {companyInfo.industry}</span>
                                    {status === 'live' && (
                                        <span className={styles.liveIndicator}>
                                            <Activity size={12} /> LIVE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.priceRow}>
                            <div className={styles.price}>
                                {displayPrice ? `₹${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₹ —'}
                            </div>
                            {displayPrice ? (
                                <div className={styles.change} style={{ color: isPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    {isPositive ? '+' : ''}{currentChangeAmount.toFixed(2)} ({currentChangePercent.toFixed(2)}%)
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Chart Section */}
                <section className={styles.chartSection}>
                    <Card className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <div className={styles.timeframeTabs}>
                                {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'ALL'].map(tf => (
                                    <button
                                        key={tf}
                                        className={clsx(styles.tfTab, timeframe === tf && styles.active)}
                                        onClick={() => setTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.liveIndicator}>
                                <span className={styles.dot}></span> Live Data
                            </div>
                        </div>
                        <div className={styles.chartHost}>
                            {isLoadingChart ? (
                                <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                    Loading Chart...
                                </div>
                            ) : (
                                <FinancialChart
                                    data={historicalChartData}
                                    height={350}
                                    color={isPositive ? 'var(--status-success)' : 'var(--status-danger)'}
                                />
                            )}
                        </div>
                    </Card>
                </section>

                {/* Grid Layout for details */}
                <div className={styles.detailsGrid}>
                    <div className={styles.mainContent}>
                        {/* News Highlights */}

                        {/* Quick Stats Grid */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionHeading}>Quick Stats</h2>
                                {fundamentals && !isLoadingFundamentals && (
                                    <Badge
                                        variant={dataSource === 'yfinance-python' ? 'success' : 'warning'}
                                        style={{ fontSize: '11px' }}
                                    >
                                        {dataSource === 'yfinance-python' ? 'Live Data' : 'Sample Data'}
                                    </Badge>
                                )}
                            </div>
                            {isLoadingFundamentals ? (
                                <div className={styles.statsGrid}>
                                    {[...Array(7)].map((_, i) => (
                                        <Card key={i} variant="glass" className={styles.statCard}>
                                            <div className={styles.statLabel}>Loading...</div>
                                            <div className={styles.statVal}>--</div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.statsGrid}>
                                    {stats.map((stat: any) => (
                                        <Card key={stat.label} variant="glass" className={styles.statCard}>
                                            <div className={styles.statLabel}>{stat.label}</div>
                                            <div className={styles.statVal}>{stat.value}</div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>


                        {/* Financial Performance */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionHeading}>Financial Performance</h2>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <Badge variant="neutral">Quarterly Trends</Badge>
                                </div>
                            </div>

                            {/* Check if financial data exists */}
                            {!data.financials?.quarterly || data.financials.quarterly.length === 0 ? (
                                <Card className={styles.chartCard}>
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        <h3 style={{ marginBottom: '8px', color: '#666' }}>No Financial Data Available</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                            Quarterly financial data is not available for this stock.
                                        </p>
                                    </div>
                                </Card>
                            ) : (
                                <div>
                                    {/* Financial Charts */}
                                    <Card className={styles.chartCard}>
                                        <div className={styles.chartHeader}>
                                            <h3 className={styles.chartTitle}>Financials</h3>
                                            <div className={styles.chartTabs}>
                                                <button
                                                    className={`${styles.tabButton} ${activeMetric === 'revenue' ? styles.active : ''}`}
                                                    onClick={() => setActiveMetric('revenue')}
                                                >
                                                    <span>Revenue</span>
                                                </button>
                                                <button
                                                    className={`${styles.tabButton} ${activeMetric === 'profit' ? styles.active : ''}`}
                                                    onClick={() => setActiveMetric('profit')}
                                                >
                                                    <span>Profit</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.chartContainer}>
                                            <ResponsiveContainer width="100%" height={380}>
                                                <BarChart
                                                    data={chartData}
                                                    margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
                                                    barCategoryGap="25%"
                                                >
                                                    <defs>
                                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={metricConfig.color} stopOpacity={0.9} />
                                                            <stop offset="100%" stopColor={metricConfig.color} stopOpacity={0.6} />
                                                        </linearGradient>
                                                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={metricConfig.color} floodOpacity="0.3" />
                                                        </filter>
                                                    </defs>
                                                    <XAxis
                                                        dataKey="period"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fill: '#888',
                                                            fontSize: 13,
                                                            fontWeight: 500
                                                        }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fill: '#888',
                                                            fontSize: 12,
                                                            fontWeight: 400
                                                        }}
                                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                                        width={60}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                            border: `1px solid ${metricConfig.color}`,
                                                            borderRadius: '12px',
                                                            color: '#fff',
                                                            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                                                            backdropFilter: 'blur(10px)'
                                                        }}
                                                        formatter={(value: any) => [metricConfig.formatter(value), metricConfig.name]}
                                                        labelFormatter={(label) => `Quarter: ${label}`}
                                                        cursor={{
                                                            fill: 'rgba(255, 255, 255, 0.05)',
                                                            radius: 8
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey={metricConfig.dataKey}
                                                        name={metricConfig.name}
                                                        fill="url(#barGradient)"
                                                        radius={[8, 8, 0, 0]}
                                                        barSize={40}
                                                        filter="url(#shadow)"
                                                        animationDuration={1500}
                                                    >
                                                        <LabelList
                                                            dataKey={metricConfig.dataKey}
                                                            position="top"
                                                            offset={15}
                                                            fill="#ccc"
                                                            fontSize={12}
                                                            fontWeight={600}
                                                            formatter={(val: any) => val?.toLocaleString?.('en-IN') || val}
                                                        />
                                                        {chartData.map((entry: any, index: number) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={`url(#barGradient)`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className={styles.chartFooter}>
                                                <div className={styles.chartNote}>*All values are in Rs. Cr</div>
                                                <div className={styles.chartActions}>
                                                    <button
                                                        className={`${styles.periodButton} ${activePeriod === 'quarterly' ? styles.active : ''}`}
                                                        onClick={() => setActivePeriod('quarterly')}
                                                    >
                                                        Quarterly
                                                    </button>
                                                    <button
                                                        className={`${styles.periodButton} ${activePeriod === 'yearly' ? styles.active : ''}`}
                                                        onClick={() => setActivePeriod('yearly')}
                                                    >
                                                        Yearly
                                                    </button>
                                                    <button
                                                        className={styles.detailsButton}
                                                        onClick={() => setShowDetails(!showDetails)}
                                                    >
                                                        {showDetails ? 'Hide Details' : 'See Details'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Details Panel */}
                                    {showDetails && (
                                        <Card className={styles.detailsPanel}>
                                            <div className={styles.detailsHeader}>
                                                <h4>Financial Details - {metricConfig.name}</h4>
                                                <button
                                                    className={styles.closeButton}
                                                    onClick={() => setShowDetails(false)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className={styles.detailsContent}>
                                                <div className={styles.detailsPanelGrid}>
                                                    {chartData.map((item: any, index: number) => (
                                                        <div key={index} className={styles.detailItem}>
                                                            <div className={styles.detailPeriod}>{item.period}</div>
                                                            <div className={styles.detailValue}>
                                                                {metricConfig.formatter(item[metricConfig.dataKey])}
                                                            </div>
                                                            {index > 0 && (
                                                                <div className={styles.detailChange}>
                                                                    {(() => {
                                                                        const current = item[metricConfig.dataKey];
                                                                        const previous = chartData[index - 1][metricConfig.dataKey];
                                                                        const change = ((current - previous) / previous * 100).toFixed(1);
                                                                        const isPositive = parseFloat(change) >= 0;
                                                                        return (
                                                                            <span className={isPositive ? styles.positive : styles.negative}>
                                                                                {isPositive ? '+' : ''}{change}%
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Performance Metrics Cards */}
                                    <div className={styles.performanceMetrics}>
                                        <Card className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Revenue Growth</span>
                                                <Badge variant="success">QoQ</Badge>
                                            </div>
                                            <div className={styles.metricValue}>
                                                {(() => {
                                                    const quarterly = data.financials.quarterly as any[];
                                                    if (!quarterly || quarterly.length < 2) return 'N/A';

                                                    const latest = quarterly[0];
                                                    const previous = quarterly[1];
                                                    if (!latest?.revenue || !previous?.revenue) return 'N/A';

                                                    const growth = ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
                                                    const isPositive = parseFloat(growth) >= 0;
                                                    return `${isPositive ? '+' : ''}${growth}%`;
                                                })()}
                                            </div>
                                            <div className={styles.metricSubtext}>
                                                ₹{(data.financials.quarterly[0] as any)?.revenue?.toLocaleString('en-IN') || 'N/A'} Cr
                                            </div>
                                        </Card>

                                        <Card className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Profit Growth</span>
                                                <Badge variant="success">QoQ</Badge>
                                            </div>
                                            <div className={styles.metricValue}>
                                                {(() => {
                                                    const quarterly = data.financials.quarterly as any[];
                                                    if (!quarterly || quarterly.length < 2) return 'N/A';

                                                    const latest = quarterly[0];
                                                    const previous = quarterly[1];
                                                    if (!latest?.profit || !previous?.profit) return 'N/A';

                                                    const growth = ((latest.profit - previous.profit) / previous.profit * 100).toFixed(1);
                                                    const isPositive = parseFloat(growth) >= 0;
                                                    return `${isPositive ? '+' : ''}${growth}%`;
                                                })()}
                                            </div>
                                            <div className={styles.metricSubtext}>
                                                ₹{(data.financials.quarterly[0] as any)?.profit?.toLocaleString('en-IN') || 'N/A'} Cr
                                            </div>
                                        </Card>

                                        <Card className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>EPS Growth</span>
                                                <Badge variant="success">QoQ</Badge>
                                            </div>
                                            <div className={styles.metricValue}>
                                                {(() => {
                                                    const quarterly = data.financials.quarterly as any[];
                                                    if (!quarterly || quarterly.length < 2) return 'N/A';

                                                    const latest = quarterly[0];
                                                    const previous = quarterly[1];
                                                    if (!latest?.eps || !previous?.eps) return 'N/A';

                                                    const growth = ((latest.eps - previous.eps) / previous.eps * 100).toFixed(1);
                                                    const isPositive = parseFloat(growth) >= 0;
                                                    return `${isPositive ? '+' : ''}${growth}%`;
                                                })()}
                                            </div>
                                            <div className={styles.metricSubtext}>
                                                ₹{(data.financials.quarterly[0] as any)?.eps || 'N/A'}
                                            </div>
                                        </Card>

                                        <Card className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Profit Margin</span>
                                                <Badge variant="neutral">Latest</Badge>
                                            </div>
                                            <div className={styles.metricValue}>
                                                {(() => {
                                                    const quarterly = data.financials.quarterly as any[];
                                                    if (!quarterly || quarterly.length === 0) return 'N/A';

                                                    const latest = quarterly[0];
                                                    if (!latest?.profit || !latest?.revenue || latest.revenue === 0) return 'N/A';

                                                    const margin = (latest.profit / latest.revenue * 100).toFixed(1);
                                                    return `${margin}%`;
                                                })()}
                                            </div>
                                            <div className={styles.metricSubtext}>
                                                Net Margin
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Technical Indicators */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionHeading}>Technical Indicators</h2>
                            <div className={styles.techIndicators}>
                                {data.technicals.map((tech: any) => (
                                    <Card key={tech.name} className={styles.techCard}>
                                        <div className={styles.techHeader}>
                                            <span className={styles.techName}>{tech.name}</span>
                                            <Badge
                                                variant={tech.status.toLowerCase() as any}
                                                title={tech.value} /* Tooltip for full value */
                                            >
                                                {tech.value}
                                            </Badge>
                                        </div>
                                        <p className={styles.techDesc}>{tech.interpretation}</p>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className={styles.sidebar}>
                        {/* About Company */}
                        <Card variant="glass" className={styles.sidebarSection}>
                            <h3 className={styles.sidebarHeading}>About Company</h3>
                            <p className={styles.aboutText}>{companyInfo.about}</p>
                            <div className={styles.metaInfo}>
                                <div className={styles.metaRow}>
                                    <Briefcase size={16} />
                                    <span>{companyInfo.sector} | {companyInfo.industry}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <Search size={16} />
                                    <span>Founded: {companyInfo.founded}</span>
                                </div>
                                {companyInfo.website && (
                                    <a
                                        href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                                        className={styles.websiteLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {companyInfo.website.replace(/^https?:\/\//, '')} <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </Card>

                        {/* Shareholding Pattern */}
                        <Card variant="glass" className={styles.sidebarSection}>
                            <h3 className={styles.sidebarHeading}>Shareholding Pattern</h3>
                            <div className={styles.pieContainer}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={data.shareholding}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.shareholding.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className={styles.pieLegend}>
                                    {data.shareholding.map((s: any) => (
                                        <div key={s.name} className={styles.legendItem}>
                                            <span className={styles.dot} style={{ backgroundColor: s.color }}></span>
                                            <span className={styles.lLabel}>{s.name}</span>
                                            <span className={styles.lVal}>{s.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* News & Events */}
                        <Card variant="glass" className={styles.sidebarSection}>
                            <h3 className={styles.sidebarHeading}>News & Events</h3>
                            <div className={styles.newsList}>
                                {data.news.map((item: any) => (
                                    <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer" className={styles.newsItem}>
                                        <div className={styles.newsTitle}>{item.title}</div>
                                        <div className={styles.newsMeta}>{item.source} • {item.date}</div>
                                    </a>
                                ))}
                            </div>
                            <div className={styles.eventsList}>
                                <h4 className={styles.subHeading}>Upcoming Events</h4>
                                {data.events.map((event: any) => (
                                    <div key={event.id} className={styles.eventItem}>
                                        <div className={styles.eventDot}></div>
                                        <div className={styles.eventDetail}>
                                            <div className={styles.eventName}>{event.name}</div>
                                            <div className={styles.eventDate}>{event.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </main>
    );
}

