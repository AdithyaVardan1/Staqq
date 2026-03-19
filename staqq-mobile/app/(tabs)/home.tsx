import { Text, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Bookmark, Search } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import StockCard from '../../components/stocks/StockCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { api, type TrendingStock } from '../../lib/api';

export default function HomeScreen() {
    const [trending, setTrending] = useState<TrendingStock[]>([]);
    const [watchlistPrices, setWatchlistPrices] = useState<Record<string, { price: number; change: number }>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { tickers: watchlist } = useWatchlistStore();

    const fetchData = useCallback(async () => {
        try {
            const data = await api.trending();
            setTrending(data.stocks ?? []);
        } catch (err) {
            console.error('[Home] Trending fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWatchlistPrices = useCallback(async () => {
        if (watchlist.length === 0) return;
        const results = await Promise.allSettled(
            watchlist.map(t => api.price(t))
        );
        const prices: Record<string, { price: number; change: number }> = {};
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                prices[watchlist[i]] = { price: r.value.price, change: r.value.changePercent };
            }
        });
        setWatchlistPrices(prices);
    }, [watchlist]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchWatchlistPrices();
        const interval = setInterval(fetchWatchlistPrices, 30_000);
        return () => clearInterval(interval);
    }, [watchlist]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchData(), fetchWatchlistPrices()]);
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CAFF00" />
                }
            >
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 pt-3 pb-2">
                    <View>
                        <Text className="text-zinc-500 text-xs">Welcome to</Text>
                        <Text className="text-white text-2xl font-bold tracking-tight">Staqq</Text>
                    </View>
                </View>

                {/* Trending */}
                <View className="mt-4">
                    <View className="flex-row items-center px-4 mb-3">
                        <TrendingUp size={16} color="#CAFF00" />
                        <Text className="text-white font-semibold text-sm ml-2">Trending</Text>
                    </View>

                    {loading ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {[1, 2, 3].map(i => (
                                <View key={i} className="mr-3">
                                    <SkeletonLoader width={155} height={120} borderRadius={16} />
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {trending.slice(0, 15).map(stock => (
                                <StockCard
                                    key={stock.ticker}
                                    ticker={stock.ticker}
                                    name={stock.name}
                                    price={stock.price}
                                    change={stock.change}
                                    sparkline={stock.sparkline}
                                    variant="compact"
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Watchlist */}
                <View className="mt-6 px-4 pb-8">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <Bookmark size={16} color="#CAFF00" />
                            <Text className="text-white font-semibold text-sm ml-2">Watchlist</Text>
                        </View>
                        {watchlist.length > 0 && (
                            <Text className="text-zinc-500 text-xs">{watchlist.length} stocks</Text>
                        )}
                    </View>

                    {watchlist.length === 0 ? (
                        <EmptyState
                            icon={<Bookmark size={40} color="#3F3F46" />}
                            title="No stocks yet"
                            subtitle="Add stocks to your watchlist from the stock detail page"
                        />
                    ) : (
                        watchlist.map(ticker => {
                            const p = watchlistPrices[ticker];
                            return (
                                <StockCard
                                    key={ticker}
                                    ticker={ticker}
                                    name=""
                                    price={p?.price ?? 0}
                                    change={p?.change ?? 0}
                                    variant="full"
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
