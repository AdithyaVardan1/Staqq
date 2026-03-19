import { Text, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface Props {
    value: number;
    showIcon?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export default function ChangeText({ value, showIcon = false, size = 'sm', className = '' }: Props) {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-success' : 'text-danger';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <View className={`flex-row items-center ${className}`}>
            {showIcon && (
                isPositive
                    ? <TrendingUp size={size === 'sm' ? 12 : 16} color="#22C55E" />
                    : <TrendingDown size={size === 'sm' ? 12 : 16} color="#EF4444" />
            )}
            <Text className={`${color} ${textSize} font-medium ${showIcon ? 'ml-1' : ''}`}>
                {isPositive ? '+' : ''}{value.toFixed(2)}%
            </Text>
        </View>
    );
}
