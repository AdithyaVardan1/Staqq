import { create } from 'zustand';
import { api } from '../lib/api';
import type { Notification } from '../lib/api';

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    lastFetched: number | null;
    fetch: (token: string) => Promise<void>;
    markRead: (ids: string[], token: string) => Promise<void>;
    markAllRead: (token: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    lastFetched: null,

    fetch: async (token) => {
        const now = Date.now();
        const last = get().lastFetched;
        if (last && now - last < 60_000) return;
        set({ loading: true });
        try {
            const data = await api.notifications(token);
            set({
                notifications: data.notifications ?? [],
                unreadCount: data.unreadCount ?? 0,
                lastFetched: now,
            });
        } catch {
            // keep existing state
        } finally {
            set({ loading: false });
        }
    },

    markRead: async (ids, token) => {
        const prev = get().notifications;
        set(state => ({
            notifications: state.notifications.map(n =>
                ids.includes(n.id) ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - ids.length),
        }));
        try {
            await api.markNotificationsRead(ids, token);
        } catch {
            set({ notifications: prev });
        }
    },

    markAllRead: async (token) => {
        const prev = get().notifications;
        const prevCount = get().unreadCount;
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));
        try {
            await api.markAllNotificationsRead(token);
        } catch {
            set({ notifications: prev, unreadCount: prevCount });
        }
    },
}));
