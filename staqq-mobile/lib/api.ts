import { API_BASE_URL } from './config';

// ─── Types ──────────────────────────────────────────────────────────

export interface TrendingStock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changeAmount: number;
    sparkline: number[];
    marketCap?: number;
}

export interface FundamentalData {
    ticker: string;
    description: string;
    sector: string;
    industry: string;
    marketCap: number;
    peRatio: number;
    pegRatio: number;
    pbRatio: number;
    beta: number;
    divYield: number;
    netMargin: number;
    roe: number;
    roa: number;
    eps: number;
    high52: number;
    low52: number;
    debtToEquity: number;
    website: string;
    financials: {
        quarterly: { period: string; revenue: number; profit: number }[];
        annual: { period: string; revenue: number; profit: number }[];
    };
    shareholding: { name: string; value: number; color: string }[];
    technicals: { name: string; signal: string; value: number }[];
    sparkline: number[];
    price: number;
    netChange: number;
    percentChange: number;
}

export interface HistoryPoint {
    date: string;
    value: number;
}

export interface SocialPost {
    id: string;
    title: string;
    body: string;
    url: string;
    score: number;
    comments: number;
    source: 'reddit' | 'twitter';
    community: string;
    author: string | null;
    createdAt: number;
    tickers: string[];
    isHot: boolean;
    image?: string;
}

export interface AlertData {
    id: string;
    ticker: string;
    mention_count: number;
    spike_mult: number;
    baseline_avg: number;
    message: string;
    top_post_url: string | null;
    top_post_title: string | null;
    detected_at: string;
}

export interface Notification {
    id: string;
    read: boolean;
    created_at: string;
    delivered_via: string[];
    alert: AlertData;
}

export interface Subscription {
    ticker: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface SpikeData {
    ticker: string;
    spike_mult: number;
    mention_count: number;
    message: string;
    detected_at: string;
    top_post_url: string | null;
}

// ─── Base Fetch ─────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    accessToken?: string
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> ?? {}),
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

// ─── API Functions ──────────────────────────────────────────────────

export const api = {
    // Public
    trending: () =>
        apiFetch<{ stocks: TrendingStock[] }>('/api/stocks/trending'),

    fundamentals: (ticker: string) =>
        apiFetch<{ fundamentals: FundamentalData; source: string }>(
            `/api/stocks/fundamentals?ticker=${ticker}`
        ),

    history: (ticker: string, range: string) =>
        apiFetch<{ ticker: string; range: string; history: HistoryPoint[] }>(
            `/api/stocks/history?ticker=${ticker}&range=${range}`
        ),

    price: (ticker: string) =>
        apiFetch<{ ticker: string; price: number; change: number; changePercent: number }>(
            `/api/stocks/price?ticker=${ticker}`
        ),

    pulseFeed: () =>
        apiFetch<{ posts: SocialPost[]; spikes: SpikeData[] }>('/api/pulse/feed'),

    // Auth required
    notifications: (token: string) =>
        apiFetch<{ notifications: Notification[]; unreadCount: number }>(
            '/api/alerts/notifications', {}, token
        ),

    subscriptions: (token: string) =>
        apiFetch<{ subscriptions: Subscription[] }>(
            '/api/alerts/subscriptions', {}, token
        ),

    subscribe: (ticker: string, email: string, token: string) =>
        apiFetch<{ success: boolean }>(
            '/api/alerts/subscribe',
            { method: 'POST', body: JSON.stringify({ ticker, email }) },
            token
        ),

    unsubscribe: (ticker: string, token: string) =>
        apiFetch<{ success: boolean }>(
            '/api/alerts/unsubscribe',
            { method: 'POST', body: JSON.stringify({ ticker }) },
            token
        ),

    markNotificationsRead: (ids: string[], token: string) =>
        apiFetch<{ success: boolean }>(
            '/api/alerts/notifications/read',
            { method: 'POST', body: JSON.stringify({ notificationIds: ids }) },
            token
        ),

    markAllNotificationsRead: (token: string) =>
        apiFetch<{ success: boolean }>(
            '/api/alerts/notifications/read',
            { method: 'POST', body: JSON.stringify({ all: true }) },
            token
        ),
};
