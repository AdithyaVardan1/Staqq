import { Text, View, TouchableOpacity, Linking } from 'react-native';
import { Zap, ExternalLink } from 'lucide-react-native';
import type { Notification } from '../../lib/api';

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

interface Props {
    notification: Notification;
}

export default function AlertItem({ notification }: Props) {
    const { alert } = notification;

    return (
        <View
            className={`bg-bg-card border rounded-xl p-3.5 mb-2 ${
                notification.read ? 'border-white/5' : 'border-l-2 border-brand/40 border-white/5'
            }`}
        >
            <View className="flex-row items-center mb-1.5">
                <Zap size={14} color="#CAFF00" fill="#CAFF00" />
                <Text className="text-white font-bold text-sm ml-1.5">{alert.ticker}</Text>
                <View className="bg-brand/20 rounded-full px-2 py-0.5 ml-2">
                    <Text className="text-brand text-[10px] font-bold">{alert.spike_mult.toFixed(1)}x</Text>
                </View>
                <Text className="text-zinc-600 text-[10px] ml-auto">{timeAgo(alert.detected_at)}</Text>
            </View>

            <Text className="text-zinc-400 text-xs leading-4" numberOfLines={2}>
                {alert.message}
            </Text>

            {alert.top_post_url && (
                <TouchableOpacity
                    onPress={() => Linking.openURL(alert.top_post_url!)}
                    className="flex-row items-center mt-2"
                    activeOpacity={0.7}
                >
                    <ExternalLink size={11} color="#CAFF00" />
                    <Text className="text-brand text-[10px] ml-1" numberOfLines={1}>
                        {alert.top_post_title || 'View post'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
