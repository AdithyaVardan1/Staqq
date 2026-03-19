import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useWatchlistStore } from '../store/useWatchlistStore';
import '../global.css';

export default function RootLayout() {
    const initialize = useAuthStore(s => s.initialize);
    const loadWatchlist = useWatchlistStore(s => s.load);

    useEffect(() => {
        initialize();
        loadWatchlist();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="stock/[ticker]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
                <Stack.Screen name="auth/signup" options={{ presentation: 'modal' }} />
            </Stack>
        </SafeAreaProvider>
    );
}
