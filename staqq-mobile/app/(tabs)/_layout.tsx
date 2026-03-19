import { Tabs } from 'expo-router';
import { Home, Activity, Bell, User } from 'lucide-react-native';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect } from 'react';

export default function TabLayout() {
    const unreadCount = useNotificationsStore(s => s.unreadCount);
    const fetchNotifications = useNotificationsStore(s => s.fetch);
    const getAccessToken = useAuthStore(s => s.getAccessToken);
    const user = useAuthStore(s => s.user);

    // Poll notifications every 2 min
    useEffect(() => {
        if (!user) return;
        const token = getAccessToken();
        if (!token) return;

        fetchNotifications(token);
        const interval = setInterval(() => {
            const t = getAccessToken();
            if (t) fetchNotifications(t);
        }, 120_000);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0A0A0A',
                    borderTopColor: 'rgba(255,255,255,0.08)',
                    borderTopWidth: 0.5,
                    height: 85,
                    paddingBottom: 28,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#CAFF00',
                tabBarInactiveTintColor: '#71717A',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="pulse"
                options={{
                    title: 'Pulse',
                    tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarBadgeStyle: { backgroundColor: '#CAFF00', color: '#000', fontSize: 10, fontWeight: '700' },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
