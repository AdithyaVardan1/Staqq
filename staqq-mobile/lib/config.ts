import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For dev: use machine's LAN IP so physical devices on same WiFi can reach it
// Update this IP if your network changes (run: ipconfig getifaddr en0)
const LAN_IP = '10.157.33.12';

function getDevApiUrl(): string {
    if (Platform.OS === 'web') return 'http://localhost:3000';
    if (Platform.OS === 'android') return `http://${LAN_IP}:3000`;
    // iOS simulator can use localhost, physical iOS device needs LAN IP
    return `http://${LAN_IP}:3000`;
}

export const API_BASE_URL: string =
    (Constants.expoConfig?.extra?.apiBaseUrl as string) ||
    (__DEV__ ? getDevApiUrl() : 'https://staqq.in');

export const SUPABASE_URL: string =
    (Constants.expoConfig?.extra?.supabaseUrl as string) ?? '';

export const SUPABASE_ANON_KEY: string =
    (Constants.expoConfig?.extra?.supabaseAnonKey as string) ?? '';

export const WATCHLIST_STORAGE_KEY = 'staqq_watchlist';
