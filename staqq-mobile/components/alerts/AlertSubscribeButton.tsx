import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, BellOff } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/api';

interface Props {
    ticker: string;
}

export default function AlertSubscribeButton({ ticker }: Props) {
    const router = useRouter();
    const { user, getAccessToken } = useAuthStore();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const token = getAccessToken();
        if (!token) return;
        api.subscriptions(token).then(data => {
            setIsSubscribed(
                data.subscriptions.some(s => s.ticker === ticker.toUpperCase())
            );
        }).catch(() => {});
    }, [user, ticker]);

    const handlePress = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        const token = getAccessToken();
        if (!token) return;

        setLoading(true);
        try {
            if (isSubscribed) {
                await api.unsubscribe(ticker, token);
                setIsSubscribed(false);
            } else {
                await api.subscribe(ticker, user.email ?? '', token);
                setIsSubscribed(true);
            }
        } catch {
            // revert on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`flex-row items-center justify-center rounded-xl py-3 px-5 ${
                isSubscribed ? 'bg-success/10 border border-success/30' : 'bg-brand'
            }`}
            activeOpacity={0.8}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color={isSubscribed ? '#22C55E' : '#000'} />
            ) : (
                <>
                    {isSubscribed
                        ? <BellOff size={18} color="#22C55E" />
                        : <Bell size={18} color="#000" />
                    }
                    <Text className={`font-semibold text-sm ml-2 ${isSubscribed ? 'text-success' : 'text-black'}`}>
                        {isSubscribed ? 'Subscribed' : 'Alert Me'}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
