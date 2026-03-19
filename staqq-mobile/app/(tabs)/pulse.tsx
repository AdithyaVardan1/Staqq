import { Text, View, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Activity } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import PostCard from '../../components/pulse/PostCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { api, type SocialPost, type SpikeData } from '../../lib/api';

export default function PulseScreen() {
    const router = useRouter();
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [spikes, setSpikes] = useState<SpikeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const data = await api.pulseFeed();
            setPosts(data.posts ?? []);
            setSpikes(data.spikes ?? []);
        } catch (err) {
            console.error('[Pulse] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const renderHeader = () => (
        <View>
            {/* Spike Banner */}
            {spikes.length > 0 && (
                <View className="bg-bg-card border border-white/5 mx-4 mt-3 rounded-2xl p-3.5">
                    <View className="flex-row items-center mb-2.5">
                        <Zap size={14} color="#CAFF00" fill="#CAFF00" />
                        <Text className="text-brand font-bold text-xs ml-1.5">Live Spikes</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {spikes.map(spike => (
                            <TouchableOpacity
                                key={spike.ticker}
                                onPress={() => router.push(`/stock/${spike.ticker}`)}
                                className="bg-zinc-800/80 rounded-xl px-3.5 py-2 mr-2"
                                activeOpacity={0.7}
                            >
                                <Text className="text-white font-bold text-sm">{spike.ticker}</Text>
                                <Text className="text-brand text-[10px] font-semibold mt-0.5">
                                    {spike.spike_mult.toFixed(1)}x · {spike.mention_count} mentions
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
                <View className="px-4 pt-4 pb-3 border-b border-white/5">
                    <Text className="text-white text-xl font-bold">Market Pulse</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">Live Reddit & X discussions</Text>
                </View>
                <View className="px-4 mt-4">
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} className="mb-3">
                            <SkeletonLoader width="100%" height={140} borderRadius={16} />
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg-dark" edges={['top']}>
            {/* Fixed Header */}
            <View className="px-4 pt-4 pb-3 border-b border-white/5">
                <Text className="text-white text-xl font-bold">Market Pulse</Text>
                <Text className="text-zinc-500 text-xs mt-0.5">Live Reddit & X discussions</Text>
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostCard post={item} />}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <EmptyState
                        icon={<Activity size={40} color="#3F3F46" />}
                        title="No posts yet"
                        subtitle="Pull to refresh for latest discussions"
                    />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CAFF00" />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
