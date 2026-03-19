import { Text, View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback, Component, type ReactNode } from 'react';

// Lazy-load charts only on native (they crash on web)
let LineChart: any = View;
let BarChart: any = View;
let PieChart: any = View;
if (Platform.OS !== 'web') {
    const charts = require('react-native-gifted-charts');
    LineChart = charts.LineChart;
    BarChart = charts.BarChart;
    PieChart = charts.PieChart;
}

class ChartBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
    state = { err: false };
    static getDerivedStateFromError() { return { err: true }; }
    render() { return this.state.err ? null : this.props.children; }
}
import PriceText from '../../components/ui/PriceText';
import ChangeText from '../../components/ui/ChangeText';
import StatBox from '../../components/ui/StatBox';
import AlertSubscribeButton from '../../components/alerts/AlertSubscribeButton';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { api, type FundamentalData, type HistoryPoint } from '../../lib/api';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y'] as const;

function formatMarketCap(n: number): string {
    if (!n) return 'N/A';
    if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(0)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
}

export default function StockDetailScreen() {
    const { ticker } = useLocalSearchParams<{ ticker: string }>();
    const router = useRouter();
    const { has, add, remove } = useWatchlistStore();

    const [fundamentals, setFundamentals] = useState<FundamentalData | null>(null);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [range, setRange] = useState<typeof RANGES[number]>('1M');
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const isWatchlisted = has(ticker ?? '');

    const fetchFundamentals = useCallback(async () => {
        if (!ticker) return;
        try {
            const data = await api.fundamentals(ticker);
            setFundamentals(data.fundamentals);
        } catch (err) {
            console.error('[StockDetail] Fundamentals error:', err);
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    const fetchHistory = useCallback(async () => {
        if (!ticker) return;
        setHistoryLoading(true);
        try {
            const data = await api.history(ticker, range);
            setHistory(data.history ?? []);
        } catch {
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, [ticker, range]);

    useEffect(() => { fetchFundamentals(); }, [ticker]);
    useEffect(() => { fetchHistory(); }, [ticker, range]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFundamentals(), fetchHistory()]);
        setRefreshing(false);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-bg-dark items-center justify-center">
                <ActivityIndicator size="large" color="#CAFF00" />
            </SafeAreaView>
        );
    }

    const f = fundamentals;
    const price = f?.price ?? 0;
    const change = f?.percentChange ?? 0;
    const isPositive = change >= 0;
    const lineColor = isPositive ? '#22C55E' : '#EF4444';

    // Chart data
    const chartData = history.map(h => ({ value: h.value }));
    const showEveryNth = Math.max(1, Math.floor(history.length / 5));
    const chartLabels = history.map((h, i) => {
        if (i % showEveryNth === 0) {
            const d = new Date(h.date);
            return range === '1D' ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
        return '';
    });

    // Financials bar data
    const barData = (f?.financials?.quarterly ?? []).slice(-4).flatMap(q => [
        { value: Math.max(0, q.revenue / 1e7), frontColor: '#3B82F6', label: q.period.slice(0, 6) },
        { value: Math.max(0, q.profit / 1e7), frontColor: '#22C55E', label: '' },
    ]);

    // Shareholding pie data
    const pieData = (f?.shareholding ?? []).map(s => ({
        value: s.value,
        color: s.color,
        text: `${s.value.toFixed(0)}%`,
    }));

    return (
        <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CAFF00" />
                }
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-white/5">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">{ticker}</Text>
                        <Text className="text-zinc-500 text-xs" numberOfLines={1}>
                            {f?.sector ?? ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => isWatchlisted ? remove(ticker!) : add(ticker!)}
                        className="p-2"
                    >
                        {isWatchlisted
                            ? <BookmarkCheck size={22} color="#CAFF00" fill="#CAFF00" />
                            : <Bookmark size={22} color="#71717A" />
                        }
                    </TouchableOpacity>
                </View>

                {/* Price */}
                <View className="px-4 pt-3 pb-1">
                    <PriceText amount={price} size="lg" />
                    <ChangeText value={change} showIcon size="md" className="mt-1" />
                </View>

                {/* Chart */}
                <View className="mx-4 mt-3 bg-bg-card border border-white/5 rounded-2xl p-4">
                    {historyLoading ? (
                        <View className="h-[180px] items-center justify-center">
                            <ActivityIndicator color="#CAFF00" />
                        </View>
                    ) : chartData.length > 1 ? (
                        <ChartBoundary>
                            <LineChart
                                data={chartData}
                                width={280}
                                height={180}
                                color={lineColor}
                                thickness={2}
                                hideDataPoints
                                curved
                                areaChart
                                startFillColor={lineColor}
                                startOpacity={0.15}
                                endOpacity={0}
                                noOfSections={3}
                                yAxisTextStyle={{ color: '#71717A', fontSize: 9 }}
                                xAxisLabelTextStyle={{ color: '#71717A', fontSize: 8 }}
                                rulesColor="rgba(255,255,255,0.05)"
                                yAxisColor="transparent"
                                xAxisColor="transparent"
                                isAnimated
                                animationDuration={400}
                                initialSpacing={5}
                                spacing={(280 - 10) / Math.max(chartData.length - 1, 1)}
                            />
                        </ChartBoundary>
                    ) : (
                        <View className="h-[180px] items-center justify-center">
                            <Text className="text-zinc-600 text-xs">No chart data</Text>
                        </View>
                    )}

                    {/* Range Selector */}
                    <View className="flex-row mt-3 justify-between">
                        {RANGES.map(r => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRange(r)}
                                className={`px-3 py-1.5 rounded-lg ${range === r ? 'bg-brand' : ''}`}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-xs font-semibold ${range === r ? 'text-black' : 'text-zinc-500'}`}>
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Key Stats */}
                <View className="mx-4 mt-4">
                    <Text className="text-white font-semibold text-sm mb-3">Key Stats</Text>
                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        <StatBox label="Market Cap" value={formatMarketCap(f?.marketCap ?? 0)} />
                        <StatBox label="P/E Ratio" value={f?.peRatio?.toFixed(2) ?? 'N/A'} />
                        <StatBox label="52W High" value={f?.high52 ? `₹${f.high52.toLocaleString('en-IN')}` : 'N/A'} />
                        <StatBox label="52W Low" value={f?.low52 ? `₹${f.low52.toLocaleString('en-IN')}` : 'N/A'} />
                        <StatBox label="EPS" value={f?.eps?.toFixed(2) ?? 'N/A'} />
                        <StatBox label="Div Yield" value={f?.divYield ? `${(f.divYield * 100).toFixed(2)}%` : 'N/A'} />
                        <StatBox label="Beta" value={f?.beta?.toFixed(2) ?? 'N/A'} />
                        <StatBox label="ROE" value={f?.roe ? `${(f.roe * 100).toFixed(1)}%` : 'N/A'} />
                    </View>
                </View>

                {/* About */}
                {f?.description && (
                    <View className="mx-4 mt-4 bg-bg-card border border-white/5 rounded-2xl p-4">
                        <Text className="text-white font-semibold text-sm mb-2">About</Text>
                        <Text className="text-zinc-400 text-xs leading-4" numberOfLines={5}>
                            {f.description}
                        </Text>
                        {f.sector && (
                            <Text className="text-zinc-600 text-[10px] mt-2">
                                Sector: {f.sector} · Industry: {f.industry}
                            </Text>
                        )}
                    </View>
                )}

                {/* Quarterly Financials */}
                {barData.length > 0 && (
                    <View className="mx-4 mt-4 bg-bg-card border border-white/5 rounded-2xl p-4">
                        <Text className="text-white font-semibold text-sm mb-3">Quarterly Financials (₹ Cr)</Text>
                        <View className="flex-row items-center mb-2">
                            <View className="w-2.5 h-2.5 rounded-sm bg-info mr-1.5" />
                            <Text className="text-zinc-400 text-[10px] mr-3">Revenue</Text>
                            <View className="w-2.5 h-2.5 rounded-sm bg-success mr-1.5" />
                            <Text className="text-zinc-400 text-[10px]">Profit</Text>
                        </View>
                        <ChartBoundary>
                            <BarChart
                                data={barData}
                                barWidth={12}
                                spacing={8}
                                noOfSections={3}
                                height={120}
                                yAxisTextStyle={{ color: '#71717A', fontSize: 9 }}
                                xAxisLabelTextStyle={{ color: '#71717A', fontSize: 7 }}
                                rulesColor="rgba(255,255,255,0.05)"
                                yAxisColor="transparent"
                                xAxisColor="transparent"
                                isAnimated
                            />
                        </ChartBoundary>
                    </View>
                )}

                {/* Shareholding */}
                {pieData.length > 0 && (
                    <View className="mx-4 mt-4 bg-bg-card border border-white/5 rounded-2xl p-4">
                        <Text className="text-white font-semibold text-sm mb-3">Shareholding Pattern</Text>
                        <View className="items-center">
                            <ChartBoundary>
                                <PieChart
                                    data={pieData}
                                    radius={70}
                                    innerRadius={40}
                                    donut
                                    centerLabelComponent={() => (
                                        <Text className="text-zinc-400 text-[10px]">Holders</Text>
                                    )}
                                    textColor="#fff"
                                    textSize={9}
                                    showText
                                />
                            </ChartBoundary>
                        </View>
                        <View className="flex-row flex-wrap mt-3 justify-center" style={{ gap: 12 }}>
                            {(f?.shareholding ?? []).map(s => (
                                <View key={s.name} className="flex-row items-center">
                                    <View className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: s.color }} />
                                    <Text className="text-zinc-400 text-[10px]">{s.name} {s.value.toFixed(0)}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Alert Button */}
                <View className="mx-4 mt-4 mb-8">
                    <AlertSubscribeButton ticker={ticker ?? ''} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
