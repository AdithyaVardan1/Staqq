import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
    ticker: string;
    onPress?: () => void;
}

export default function StockChip({ ticker, onPress }: Props) {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/stock/${ticker}`);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="bg-zinc-800 rounded-lg px-2.5 py-1 mr-1.5"
            activeOpacity={0.7}
        >
            <Text className="text-brand text-xs font-semibold">{ticker}</Text>
        </TouchableOpacity>
    );
}
