import { Text, View, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface Props {
    ticker: string;
    createdAt: string;
    onRemove: () => void;
}

export default function SubscriptionItem({ ticker, createdAt, onRemove }: Props) {
    const date = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
        <View className="bg-bg-card border border-white/5 rounded-xl px-3.5 py-3 mb-2 flex-row items-center">
            <View className="flex-1">
                <Text className="text-white font-bold text-sm">{ticker}</Text>
                <Text className="text-zinc-500 text-[10px] mt-0.5">Since {date}</Text>
            </View>
            <TouchableOpacity onPress={onRemove} className="p-2" activeOpacity={0.7}>
                <X size={16} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );
}
