import { Text, View } from 'react-native';

interface Props {
    label: string;
    value: string;
}

export default function StatBox({ label, value }: Props) {
    return (
        <View className="bg-zinc-900 rounded-xl px-3 py-2.5 border border-white/5" style={{ width: '48%' }}>
            <Text className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</Text>
            <Text className="text-white text-sm font-semibold">{value}</Text>
        </View>
    );
}
