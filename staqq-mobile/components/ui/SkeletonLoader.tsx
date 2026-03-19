import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface Props {
    width: number | string;
    height: number;
    borderRadius?: number;
}

export default function SkeletonLoader({ width, height, borderRadius = 8 }: Props) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 800, easing: Easing.ease }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: typeof width === 'number' ? width : undefined,
                    height,
                    borderRadius,
                    backgroundColor: '#27272A',
                },
                typeof width === 'string' ? { flex: 1 } : {},
                animatedStyle,
            ]}
        />
    );
}
