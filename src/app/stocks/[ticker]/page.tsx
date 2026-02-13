
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
    Info,
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
import { useComparisonStore } from '@/store/useComparisonStore';
import { StockLogo } from '@/components/stocks/StockLogo';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import styles from './page.module.css';

// Comprehensive Mock Data
const STOCK_DATA: any = {
    RELIANCE: {
        ticker: 'RELIANCE',
        fullTicker: 'RELIANCE.NS',
        name: 'Reliance Industries Ltd',
        price: 2450.50,
        change: 29.40,
        changePercent: 1.2,
        about: "Reliance Industries Limited is an Indian multinational conglomerate, headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles. Reliance is the largest public company in India by market capitalization and revenue.",
        sector: 'Energy',
        industry: 'Oil & Gas',
        founded: '1966',
        website: 'www.ril.com',
        history: {
            '1D': [
                { date: '10:00', value: 2420 },
                { date: '11:00', value: 2435 },
                { date: '12:00', value: 2428 },
                { date: '13:00', value: 2442 },
                { date: '14:00', value: 2445 },
                { date: '15:00', value: 2450.50 },
            ],
            '1W': [
                { date: 'Mon', value: 2380 },
                { date: 'Tue', value: 2410 },
                { date: 'Wed', value: 2405 },
                { date: 'Thu', value: 2430 },
                { date: 'Fri', value: 2450.50 },
            ],
            '1M': [
                { date: 'Week 1', value: 2350 },
                { date: 'Week 2', value: 2390 },
                { date: 'Week 3', value: 2415 },
                { date: 'Week 4', value: 2450.50 },
            ],
        },
        stats: [
            { label: 'Market Cap', value: '₹16.5T' },
            { label: '52-Week High', value: '₹2,630.00' },
            { label: '52-Week Low', value: '₹2,145.00' },
            { label: 'P/E Ratio', value: '24.5' },
            { label: 'Div Yield', value: '0.85%' },
            { label: 'Beta', value: '1.15' },
            { label: 'Volume', value: '8.4M' },
        ],
        metrics: {
            valuation: [
                { name: 'P/E Ratio', value: 24.5, industry: 21.2, info: 'Price to Earnings: How much investors pay for $1 of profit.' },
                { name: 'P/B Ratio', value: 2.1, industry: 1.8, info: 'Price to Book Value: Compares market value to accounting value.' },
                { name: 'PEG Ratio', value: 1.4, industry: 1.2, info: 'Price/Earnings to Growth: PE adjusted for earnings growth.' },
            ],
            profitability: [
                { name: 'Net Margin', value: '12.4%', industry: '10.5%', info: 'Percentage of revenue left as profit.' },
                { name: 'Return on Equity', value: '14.2%', industry: '12.8%', info: 'Profit generated with shareholders money.' },
                { name: 'Return on Assets', value: '8.5%', industry: '7.1%', info: 'How efficiently company uses its assets.' },
            ],
            leverage: [
                { name: 'Debt/Equity', value: 0.42, industry: 0.65, info: 'Total debt relative to shareholder equity.' },
                { name: 'Interest Coverage', value: 12.5, industry: 8.4, info: 'Ability to pay interest on loans from profits.' },
            ]
        },
        financials: {
            quarterly: [
                { period: 'Dec 2024', revenue: 234500, profit: 18500, eps: 27.4 },
                { period: 'Sep 2024', revenue: 228000, profit: 17800, eps: 26.3 },
                { period: 'Jun 2024', revenue: 221000, profit: 16900, eps: 25.1 },
                { period: 'Mar 2024', revenue: 215000, profit: 16500, eps: 24.5 },
            ],
            annual: [
                { year: 'FY 2024', revenue: 912000, profit: 69500, eps: 102.7 },
                { year: 'FY 2023', revenue: 875000, profit: 66700, eps: 98.4 },
                { year: 'FY 2022', revenue: 792000, profit: 60700, eps: 89.6 },
                { year: 'FY 2021', revenue: 754000, profit: 57200, eps: 84.5 }
            ]
        },
        technicals: [
            { name: 'RSI', value: 72, interpretation: 'Currently 72 - Overbought territory. Price might correct soon.', status: 'Danger' },
            { name: 'Moving Averages', value: 'Bullish', interpretation: 'Trading above 50-day MA (bullish) but below 200-day MA.', status: 'Warning' },
            { name: 'MACD', value: 'Buy Signal', interpretation: 'Bullish crossover on MACD line suggests momentum.', status: 'Success' },
        ],
        shareholding: [
            { name: 'Promoters', value: 50.4, color: '#CCFF00' },
            { name: 'FII', value: 23.2, color: '#22C55E' },
            { name: 'DII', value: 14.5, color: '#3B82F6' },
            { name: 'Public', value: 11.9, color: '#A1A1AA' },
        ],
        news: [
            { id: 1, title: 'Reliance Jio announces new 5G expansion plans', date: '2h ago', source: 'Economic Times' },
            { id: 2, title: 'Retail segment shows 20% growth in quarterly revenue', date: 'Yesterday', source: 'MoneyControl' },
            { id: 3, title: 'Reliance to invest in green energy logistics', date: '2 days ago', source: 'Reuters' },
        ],
        events: [
            { id: 1, name: 'Upcoming Earnings Call', date: 'Feb 24, 2026' },
            { id: 2, name: 'Dividend Payout Date', date: 'Mar 15, 2026' },
        ]
    },
    TCS: {
        ticker: 'TCS',
        fullTicker: 'TCS.NS',
        name: 'Tata Consultancy Services',
        price: 3400.00,
        change: -17.10,
        changePercent: -0.5,
        about: "Tata Consultancy Services (TCS) is an Indian multinational information technology (IT) services and consulting company. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries.",
        sector: 'Technology',
        industry: 'IT Services',
        founded: '1968',
        website: 'www.tcs.com',
        history: { '1D': [{ date: '10:00', value: 3450 }, { date: '15:00', value: 3400.00 }], '1W': [], '1M': [] },
        stats: [{ label: 'Market Cap', value: '₹12.4T' }, { label: 'P/E Ratio', value: '29.1' }, { label: '52-Week High', value: '₹3,600.00' }, { label: '52-Week Low', value: '₹3,100.00' }],
        metrics: {
            valuation: [{ name: 'P/E Ratio', value: 29.1, industry: 24.5, info: 'Price to Earnings ratio.' }],
            profitability: [{ name: 'Net Margin', value: '18.2%', industry: '15.5%', info: 'Percentage of revenue left as profit.' }],
            leverage: [{ name: 'Debt/Equity', value: 0.05, industry: 0.15, info: 'Total debt relative to shareholder equity.' }]
        },
        financials: {
            quarterly: [
                { period: 'Dec 2024', revenue: 60500, profit: 11000, eps: 30.2 },
                { period: 'Sep 2024', revenue: 58200, profit: 10500, eps: 28.9 },
                { period: 'Jun 2024', revenue: 56800, profit: 10200, eps: 28.1 },
                { period: 'Mar 2024', revenue: 55400, profit: 9800, eps: 27.0 }
            ],
            annual: [
                { year: 'FY 2024', revenue: 230900, profit: 41300, eps: 113.3 },
                { year: 'FY 2023', revenue: 225400, profit: 40200, eps: 110.1 },
                { year: 'FY 2022', revenue: 218200, profit: 38900, eps: 106.8 },
                { year: 'FY 2021', revenue: 212000, profit: 37500, eps: 103.2 }
            ]
        },
        technicals: [{ name: 'RSI', value: 58, interpretation: 'Neutral', status: 'Warning' }],
        shareholding: [{ name: 'Promoters', value: 72.3, color: '#CCFF00' }, { name: 'Public', value: 27.7, color: '#A1A1AA' }],
        news: [{ id: 1, title: 'TCS wins large contract', date: '3h ago', source: 'MoneyControl' }],
        events: [{ id: 1, name: 'Board Meeting', date: 'Feb 15, 2026' }]
    },
    HDFCBANK: {
        ticker: 'HDFCBANK',
        fullTicker: 'HDFCBANK.NS',
        name: 'HDFC Bank Ltd',
        price: 1650.75,
        change: 13.20,
        changePercent: 0.8,
        about: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and the world's tenth largest bank by market capitalization.",
        sector: 'Financial Services',
        industry: 'Banking',
        founded: '1994',
        website: 'www.hdfcbank.com',
        history: { '1D': [{ date: '10:00', value: 1620 }, { date: '15:00', value: 1650.75 }], '1W': [], '1M': [] },
        stats: [{ label: 'Market Cap', value: '₹9.2T' }, { label: 'P/E Ratio', value: '18.4' }, { label: '52-Week High', value: '₹1,750.00' }, { label: '52-Week Low', value: '₹1,450.00' }],
        metrics: {
            valuation: [{ name: 'P/E Ratio', value: 18.4, industry: 16.2, info: 'Price to Earnings ratio.' }],
            profitability: [{ name: 'NIM', value: '4.1%', industry: '3.8%', info: 'Net Interest Margin.' }],
            leverage: [{ name: 'CAR', value: '18.5%', industry: '16.5%', info: 'Capital Adequacy Ratio.' }]
        },
        financials: {
            quarterly: [
                { period: 'Dec 2024', revenue: 78000, profit: 16000, eps: 21.4 },
                { period: 'Sep 2024', revenue: 75500, profit: 15200, eps: 20.8 },
                { period: 'Jun 2024', revenue: 73200, profit: 14800, eps: 20.2 },
                { period: 'Mar 2024', revenue: 71000, profit: 14200, eps: 19.5 }
            ],
            annual: [
                { year: 'FY 2024', revenue: 297700, profit: 60300, eps: 82.7 },
                { year: 'FY 2023', revenue: 285200, profit: 57800, eps: 79.4 },
                { year: 'FY 2022', revenue: 272500, profit: 55100, eps: 75.8 },
                { year: 'FY 2021', revenue: 258900, profit: 52200, eps: 71.9 }
            ]
        },
        technicals: [{ name: 'RSI', value: 45, interpretation: 'Bearish', status: 'Warning' }],
        shareholding: [{ name: 'Promoters', value: 0.0, color: '#CCFF00' }, { name: 'FII', value: 52.4, color: '#22C55E' }, { name: 'DII', value: 27.5, color: '#3B82F6' }, { name: 'Public', value: 20.1, color: '#A1A1AA' }],
        news: [{ id: 1, title: 'HDFC Bank merger synergies begin', date: '1d ago', source: 'Reuters' }],
        events: [{ id: 1, name: 'AGM', date: 'Aug 10, 2026' }]
    },
    INFY: {
        ticker: 'INFY',
        fullTicker: 'INFY.NS',
        name: 'Infosys Ltd',
        price: 1450.20,
        change: -17.50,
        changePercent: -1.2,
        about: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.",
        sector: 'Technology',
        industry: 'IT Services',
        founded: '1981',
        website: 'www.infosys.com',
        history: { '1D': [{ date: '10:00', value: 1480 }, { date: '15:00', value: 1450.20 }], '1W': [], '1M': [] },
        stats: [{ label: 'Market Cap', value: '₹6.1T' }, { label: 'P/E Ratio', value: '22.8' }, { label: '52-Week High', value: '₹1,650.00' }, { label: '52-Week Low', value: '₹1,380.00' }],
        metrics: {
            valuation: [{ name: 'P/E Ratio', value: 22.8, industry: 24.5, info: 'Price to Earnings ratio.' }],
            profitability: [{ name: 'ROE', value: '31.2%', industry: '25.5%', info: 'Return on Equity.' }],
            leverage: [{ name: 'Debt/Equity', value: 0.0, industry: 0.15, info: 'Total debt relative to shareholder equity.' }]
        },
        financials: {
            quarterly: [
                { period: 'Dec 2024', revenue: 38000, profit: 6000, eps: 14.5 },
                { period: 'Sep 2024', revenue: 36800, profit: 5800, eps: 14.1 },
                { period: 'Jun 2024', revenue: 35500, profit: 5600, eps: 13.8 },
                { period: 'Mar 2024', revenue: 34200, profit: 5400, eps: 13.2 }
            ],
            annual: [
                { year: 'FY 2024', revenue: 144500, profit: 23000, eps: 55.6 },
                { year: 'FY 2023', revenue: 138900, profit: 22100, eps: 53.4 },
                { year: 'FY 2022', revenue: 132800, profit: 21200, eps: 51.2 },
                { year: 'FY 2021', revenue: 127500, profit: 20100, eps: 48.6 }
            ]
        },
        technicals: [{ name: 'RSI', value: 52, interpretation: 'Neutral', status: 'Warning' }],
        shareholding: [{ name: 'Promoters', value: 13.1, color: '#CCFF00' }, { name: 'FII', value: 34.2, color: '#22C55E' }, { name: 'Public', value: 52.7, color: '#A1A1AA' }],
        news: [{ id: 1, title: 'Infosys expands AI platform', date: '4h ago', source: 'Business Standard' }],
        events: [{ id: 1, name: 'Earnings Call', date: 'Jan 15, 2026' }]
    },
    ITC: {
        ticker: 'ITC',
        fullTicker: 'ITC.NS',
        name: 'ITC Limited',
        price: 450.00,
        change: 10.90,
        changePercent: 2.5,
        about: "ITC Limited is an Indian multinational conglomerate company headquartered in Kolkata. It has a diversified presence across industries such as FMCG, hotels, software, packaging, paperboards, specialty papers and agribusiness.",
        sector: 'Consumer Goods',
        industry: 'FMCG',
        founded: '1910',
        website: 'www.itcportal.com',
        history: { '1D': [{ date: '10:00', value: 430 }, { date: '15:00', value: 450.00 }], '1W': [], '1M': [] },
        stats: [{ label: 'Market Cap', value: '₹5.6T' }, { label: 'P/E Ratio', value: '26.5' }, { label: '52-Week High', value: '₹499.00' }, { label: '52-Week Low', value: '₹390.00' }],
        metrics: {
            valuation: [{ name: 'P/E Ratio', value: 26.5, industry: 45.2, info: 'Price to Earnings ratio.' }],
            profitability: [{ name: 'Net Margin', value: '28.4%', industry: '12.5%', info: 'Percentage of revenue left as profit.' }],
            leverage: [{ name: 'Debt/Equity', value: 0.01, industry: 0.25, info: 'Total debt relative to shareholder equity.' }]
        },
        financials: {
            quarterly: [
                { period: 'Dec 2024', revenue: 19000, profit: 5400, eps: 4.3 },
                { period: 'Sep 2024', revenue: 18200, profit: 5100, eps: 4.1 },
                { period: 'Jun 2024', revenue: 17800, profit: 4900, eps: 3.9 },
                { period: 'Mar 2024', revenue: 17200, profit: 4700, eps: 3.8 }
            ],
            annual: [
                { year: 'FY 2024', revenue: 72200, profit: 20100, eps: 16.1 },
                { year: 'FY 2023', revenue: 69800, profit: 19400, eps: 15.6 },
                { year: 'FY 2022', revenue: 67100, profit: 18700, eps: 15.0 },
                { year: 'FY 2021', revenue: 64500, profit: 17900, eps: 14.4 }
            ]
        },
        technicals: [{ name: 'RSI', value: 68, interpretation: 'Bullish', status: 'Success' }],
        shareholding: [{ name: 'Promoters', value: 0.0, color: '#CCFF00' }, { name: 'FII', value: 42.1, color: '#22C55E' }, { name: 'Public', value: 57.9, color: '#A1A1AA' }],
        news: [{ id: 1, title: 'ITC hotel demerger update', date: 'Yesterday', source: 'Financial Express' }],
        events: [{ id: 1, name: 'AGM', date: 'Jul 20, 2026' }]
    }
};

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
            networth: number;
            eps: number;
        }[];
        annual: {
            year: string;
            revenue: number;
            profit: number;
            networth: number;
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
    const [dataSource, setDataSource] = useState<'yfinance' | 'yfinance-python' | 'mock-fallback' | null>(null);

    // Financial chart state
    const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit' | 'networth'>('revenue');
    const [activePeriod, setActivePeriod] = useState<'quarterly' | 'yearly'>('quarterly');
    const [activeHeaderTab, setActiveHeaderTab] = useState('Overview');
    const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
    const isWatched = isInWatchlist(data.ticker);

    // Comparison Logic
    const { selectedTickers, addTicker, removeTicker, setTriggerSearch } = useComparisonStore();
    const isInComparison = selectedTickers.includes(data.ticker);

    const toggleStock = () => {
        if (isInComparison) {
            removeTicker(data.ticker);
        } else {
            if (selectedTickers.length >= 3) {
                // If this is the 4th stock, add it and go directly to comparison
                addTicker(data.ticker);
                router.push('/stocks/compare');
            } else {
                addTicker(data.ticker);
                setTriggerSearch(true);
            }
        }
    };
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
                networth: item.revenue ? Math.round(item.revenue * 0.4) : 0 // Synthetic placeholder for UI
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
            },
            networth: {
                dataKey: 'networth',
                name: 'Net Worth',
                color: '#8B5CF6',
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
                            variant={isInComparison ? "primary" : "outline"}
                            size="sm"
                            className={styles.watchlistBtn}
                            onClick={toggleStock}
                        >
                            <Activity size={18} />
                            {isInComparison ? 'Added to Compare' : 'Compare'}
                        </Button>
                        <Button
                            variant={isWatched ? "primary" : "outline"}
                            size="sm"
                            className={styles.watchlistBtn}
                            onClick={handleWatchlistToggle}
                        >
                            <Bookmark size={18} fill={isWatched ? "currentColor" : "none"} />
                            {isWatched ? 'In Watchlist' : 'Watchlist'}
                        </Button>
                    </div>
                </div>

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
                                    {status === 'connected' && (
                                        <span className={styles.liveIndicator}>
                                            <Activity size={12} /> LIVE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.priceRow}>
                            <div className={styles.price}>₹{(displayPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className={styles.change} style={{ color: isPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                {isPositive ? '+' : ''}{currentChangeAmount.toFixed(2)} ({currentChangePercent.toFixed(2)}%)
                            </div>
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
                                                <button
                                                    className={`${styles.tabButton} ${activeMetric === 'networth' ? styles.active : ''}`}
                                                    onClick={() => setActiveMetric('networth')}
                                                >
                                                    <span>Net Worth</span>
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
                                                        tickFormatter={(value) => {
                                                            if (activeMetric === 'networth') return `${(value / 1000).toFixed(0)}K`;
                                                            return `${(value / 1000).toFixed(0)}K`;
                                                        }}
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
                                                <div className={styles.detailsGrid}>
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
                            <Link href="/learn" className={styles.learnLink}>
                                What are these indicators? <ArrowLeft size={14} style={{ transform: 'rotate(180deg)', marginLeft: 4 }} />
                            </Link>
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

// Sub-component for Metric Rows
function MetricRow({ metric }: { metric: any }) {
    const isPercentage = typeof metric.value === 'string' && metric.value.includes('%');
    const isNumeric = typeof metric.value === 'number';

    // Calculate comparison for visual bar
    const getComparisonPercentage = () => {
        if (isPercentage) {
            const companyVal = parseFloat(metric.value.replace('%', ''));
            const industryVal = parseFloat(metric.industry.replace('%', ''));
            if (industryVal === 0) return 50;
            return Math.min(Math.max((companyVal / industryVal) * 50, 10), 90);
        } else if (isNumeric) {
            const companyVal = metric.value;
            const industryVal = metric.industry;
            if (industryVal === 0) return 50;
            return Math.min(Math.max((companyVal / industryVal) * 50, 10), 90);
        }
        return 50;
    };

    const comparisonPercentage = getComparisonPercentage();
    const isAboveIndustry = comparisonPercentage > 50;

    return (
        <div className={styles.metricRow}>
            <div className={styles.mInfo}>
                <div className={styles.mName}>
                    {metric.name}
                    <span className={styles.mTooltipIcon}>
                        <Info size={12} />
                        <span className={styles.mTooltipText}>{metric.info}</span>
                    </span>
                </div>
                <div className={styles.mComparison}>
                    Company: <span className={styles.mHighlight} style={{ color: isAboveIndustry ? 'var(--status-success)' : 'var(--status-warning)' }}>
                        {isNumeric ? metric.value.toFixed(2) : metric.value}
                    </span> |
                    Ind. Avg: <span className={styles.mSecondary}>
                        {isNumeric ? metric.industry.toFixed(2) : metric.industry}
                    </span>
                </div>
            </div>
            <div className={styles.mVisual}>
                <div className={styles.mBarTrack}>
                    <div
                        className={styles.mBarFill}
                        style={{
                            width: `${comparisonPercentage}%`,
                            backgroundColor: isAboveIndustry ? 'var(--status-success)' : 'var(--status-warning)'
                        }}
                    ></div>
                    <div
                        className={styles.mBarAvg}
                        style={{ left: '50%' }}
                        title="Industry Average"
                    ></div>
                </div>
            </div>
        </div>
    );
}
