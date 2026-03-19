import { Text, View } from 'react-native';

interface Props {
    label: string;
    variant?: 'hot' | 'live' | 'spike' | 'source' | 'neutral';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
    hot: { bg: 'bg-warning/20', text: 'text-warning' },
    live: { bg: 'bg-success/20', text: 'text-success' },
    spike: { bg: 'bg-brand/20', text: 'text-brand' },
    source: { bg: 'bg-info/20', text: 'text-info' },
    neutral: { bg: 'bg-zinc-800', text: 'text-zinc-400' },
};

export default function Badge({ label, variant = 'neutral' }: Props) {
    const style = variantStyles[variant];
    return (
        <View className={`${style.bg} rounded-full px-2 py-0.5`}>
            <Text className={`${style.text} text-[10px] font-semibold`}>{label}</Text>
        </View>
    );
}
