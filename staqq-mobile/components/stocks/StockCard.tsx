import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ChangeText from '../ui/ChangeText';
import PriceText from '../ui/PriceText';
import SparklineChart from './SparklineChart';

interface Props {
    ticker: string;
    name: string;
    price: number;
    change: number;
    sparkline?: number[];
    variant?: 'compact' | 'full';
}

export default function StockCard({ ticker, name, price, change, sparkline, variant = 'full' }: Props) {
    const router = useRouter();
    const isPositive = change >= 0;

    if (variant === 'compact') {
        return (
            <TouchableOpacity
                onPress={() => router.push(`/stock/${ticker}`)}
                className="bg-bg-card border border-white/5 rounded-2xl px-3.5 py-3 mr-3"
                style={{ width: 155 }}
                activeOpacity={0.7}
            >
                <Text className="text-white font-bold text-sm" numberOfLines={1}>{ticker}</Text>
                <Text className="text-zinc-500 text-[10px] mt-0.5" numberOfLines={1}>{name}</Text>
                <View className="mt-2.5 mb-2">
                    {sparkline && sparkline.length > 1 && (
                        <SparklineChart data={sparkline} isPositive={isPositive} width={125} height={28} />
                    )}
                </View>
                <PriceText amount={price} size="sm" />
                <ChangeText value={change} size="sm" />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={() => router.push(`/stock/${ticker}`)}
            className="bg-bg-card border border-white/5 rounded-2xl px-4 py-3.5 mb-2.5 flex-row items-center"
            activeOpacity={0.7}
        >
            <View className="flex-1 mr-3">
                <Text className="text-white font-bold text-sm">{ticker}</Text>
                <Text className="text-zinc-500 text-xs mt-0.5" numberOfLines={1}>{name}</Text>
            </View>
            {sparkline && sparkline.length > 1 && (
                <View className="mr-3">
                    <SparklineChart data={sparkline} isPositive={isPositive} width={50} height={24} />
                </View>
            )}
            <View className="items-end">
                <PriceText amount={price} size="sm" />
                <ChangeText value={change} size="sm" />
            </View>
        </TouchableOpacity>
    );
}
