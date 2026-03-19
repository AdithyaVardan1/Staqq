import { Text, View, TouchableOpacity } from 'react-native';
import type { ReactNode } from 'react';

interface Props {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
    return (
        <View className="items-center justify-center py-12 px-6">
            <View className="mb-4">{icon}</View>
            <Text className="text-white text-lg font-semibold text-center">{title}</Text>
            {subtitle && (
                <Text className="text-zinc-400 text-sm text-center mt-1.5">{subtitle}</Text>
            )}
            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="bg-brand rounded-xl px-6 py-2.5 mt-5"
                    activeOpacity={0.8}
                >
                    <Text className="text-black font-semibold text-sm">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
