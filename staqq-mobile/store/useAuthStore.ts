import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
    getAccessToken: () => string | undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    loading: true,

    initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null, loading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null });
        });
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        set({ session: data.session, user: data.user });
        return {};
    },

    signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        return {};
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
    },

    getAccessToken: () => get().session?.access_token,
}));
