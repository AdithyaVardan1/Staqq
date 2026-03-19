import { View, Platform } from 'react-native';
import { Component, type ReactNode } from 'react';

// Error boundary to catch chart rendering failures on web
class ChartErrorBoundary extends Component<{ children: ReactNode; width: number; height: number }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <View style={{ width: this.props.width, height: this.props.height }} />;
        return this.props.children;
    }
}

interface Props {
    data: number[];
    isPositive: boolean;
    width?: number;
    height?: number;
}

export default function SparklineChart({ data, isPositive, width = 60, height = 30 }: Props) {
    if (!data || data.length < 2) return null;

    // Skip chart rendering on web to avoid gifted-charts web issues
    if (Platform.OS === 'web') {
        return <View style={{ width, height }} />;
    }

    const { LineChart } = require('react-native-gifted-charts');
    const color = isPositive ? '#22C55E' : '#EF4444';
    const chartData = data.map((value: number) => ({ value }));

    return (
        <ChartErrorBoundary width={width} height={height}>
            <View style={{ width, height }} className="overflow-hidden">
                <LineChart
                    data={chartData}
                    width={width}
                    height={height}
                    color={color}
                    thickness={1.5}
                    hideDataPoints
                    hideYAxisText
                    hideAxesAndRules
                    curved
                    adjustToWidth
                    areaChart
                    startFillColor={color}
                    startOpacity={0.15}
                    endOpacity={0}
                    isAnimated={false}
                    initialSpacing={0}
                    endSpacing={0}
                    spacing={(width - 10) / Math.max(data.length - 1, 1)}
                />
            </View>
        </ChartErrorBoundary>
    );
}
