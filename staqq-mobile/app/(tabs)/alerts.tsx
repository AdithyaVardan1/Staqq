import { Text, View, ScrollView, Switch, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ShieldCheck } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import AlertItem from '../../components/alerts/AlertItem';
import SubscriptionItem from '../../components/alerts/SubscriptionItem';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { api, type Subscription } from '../../lib/api';
import { TouchableOpacity } from 'react-native';

export default function AlertsScreen() {
    const router = useRouter();
    const { user, getAccessToken } = useAuthStore();
    const { notifications, unreadCount, loading: notifsLoading, fetch: fetchNotifs } = useNotificationsStore();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [hasAll, setHasAll] = useState(false);

    const fetchSubs = useCallback(async () => {
        const token = getAccessToken();
        if (!token) return;
        try {
            const data = await api.subscriptions(token);
            setSubscriptions(data.subscriptions ?? []);
            setHasAll(data.subscriptions?.some(s => s.ticker === 'ALL') ?? false);
        } catch {}
    }, [getAccessToken]);

    useEffect(() => {
        if (!user) return;
        const token = getAccessToken();
        if (!token) return;
        fetchSubs();
        fetchNotifs(token);
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        const token = getAccessToken();
        if (token) {
            await Promise.all([fetchSubs(), fetchNotifs(token)]);
        }
        setRefreshing(false);
    };

    const toggleAll = async () => {
        const token = getAccessToken();
        if (!token || !user) return;
        try {
            if (hasAll) {
                await api.unsubscribe('ALL', token);
                setHasAll(false);
            } else {
                await api.subscribe('ALL', user.email ?? '', token);
                setHasAll(true);
            }
            fetchSubs();
        } catch {}
    };

    const handleRemoveSub = async (ticker: string) => {
        const token = getAccessToken();
        if (!token) return;
        try {
            await api.unsubscribe(ticker, token);
            setSubscriptions(prev => prev.filter(s => s.ticker !== ticker));
        } catch {}
    };

    // Auth gate
    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
                <EmptyState
                    icon={<Bell size={48} color="#3F3F46" />}
                    title="Sign in to manage alerts"
                    subtitle="Get notified when stocks spike on Reddit"
                    actionLabel="Sign In"
                    onAction={() => router.push('/auth/login')}
                />
            </SafeAreaView>
        );
    }

    const tickerSubs = subscriptions.filter(s => s.ticker !== 'ALL');

    return (
        <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CAFF00" />
                }
            >
                {/* Header */}
                <View className="px-4 pt-4 pb-3">
                    <Text className="text-white text-xl font-bold">Spike Alerts</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">Reddit mention surge notifications</Text>
                </View>

                {/* All Tickers Toggle */}
                <View className="mx-4 bg-bg-card border border-white/5 rounded-2xl p-4 mb-4">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center flex-1 mr-3">
                            <ShieldCheck size={18} color="#CAFF00" />
                            <View className="ml-2.5">
                                <Text className="text-white font-semibold text-sm">All Tickers</Text>
                                <Text className="text-zinc-500 text-[10px] mt-0.5">Get alerted for any spike</Text>
                            </View>
                        </View>
                        <Switch
                            value={hasAll}
                            onValueChange={toggleAll}
                            trackColor={{ false: '#27272A', true: '#CAFF00' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Active Subscriptions */}
                <View className="mx-4 mb-4">
                    <Text className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
                        Active Subscriptions ({tickerSubs.length})
                    </Text>
                    {tickerSubs.length === 0 ? (
                        <Text className="text-zinc-600 text-xs py-4 text-center">
                            No individual ticker subscriptions
                        </Text>
                    ) : (
                        tickerSubs.map(sub => (
                            <SubscriptionItem
                                key={sub.ticker}
                                ticker={sub.ticker}
                                createdAt={sub.created_at}
                                onRemove={() => handleRemoveSub(sub.ticker)}
                            />
                        ))
                    )}
                </View>

                {/* Recent Notifications */}
                <View className="mx-4 pb-8">
                    <Text className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
                        Recent Alerts
                    </Text>
                    {notifsLoading && notifications.length === 0 ? (
                        <ActivityIndicator color="#CAFF00" className="py-8" />
                    ) : notifications.length === 0 ? (
                        <Text className="text-zinc-600 text-xs py-4 text-center">
                            No alerts yet. They'll appear here when spikes are detected.
                        </Text>
                    ) : (
                        notifications.map(n => (
                            <AlertItem key={n.id} notification={n} />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
