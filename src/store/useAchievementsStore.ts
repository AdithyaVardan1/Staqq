
import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { Achievement, fetchAchievements, fetchUserAchievements } from '@/lib/achievements';

interface AchievementsState {
    userId: string | null;
    achievements: Achievement[];
    unlockedIds: Set<string>;
    toastQueue: Achievement[];
    loading: boolean;
    initialized: boolean;

    initialize: (userId?: string) => Promise<void>;
    unlock: (achievementId: string) => Promise<void>;
    debugReset: (achievementId: string) => Promise<void>;
    dismissToast: () => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
    userId: null,
    achievements: [],
    unlockedIds: new Set(),
    toastQueue: [],
    loading: false,
    initialized: false,

    initialize: async (userId?: string) => {
        if (get().initialized) return;
        set({ loading: true, userId: userId || null });

        try {
            const allAchievements = await fetchAchievements();
            let unlocked = new Set<string>();

            if (userId) {
                const userUnlocked = await fetchUserAchievements(userId);
                unlocked = new Set(userUnlocked.map(u => u.achievement_id));
            }

            set({
                achievements: allAchievements || [],
                unlockedIds: unlocked,
                initialized: true
            });
        } catch (e) {
            console.error("Failed to initialize achievements:", e);
        } finally {
            set({ loading: false });
        }
    },

    unlock: async (achievementId: string) => {
        let { unlockedIds, achievements, userId, initialized, initialize } = get();

        if (!initialized) {
            await initialize(userId || undefined);
            // Refresh state after init
            const newState = get();
            unlockedIds = newState.unlockedIds;
            achievements = newState.achievements;
            userId = newState.userId;
        }

        if (unlockedIds.has(achievementId)) return; // Already unlocked

        // Optimistic Update
        const newUnlocked = new Set(unlockedIds);
        newUnlocked.add(achievementId);

        const achievement = achievements.find(a => a.id === achievementId);

        set(state => ({
            unlockedIds: newUnlocked,
            toastQueue: achievement ? [...state.toastQueue, achievement] : state.toastQueue
        }));

        if (userId) {
            const supabase = createClient();
            const { error } = await supabase
                .from('user_achievements')
                .insert({ user_id: userId, achievement_id: achievementId });

            if (error) {
                console.error(`Failed to persist unlock for ${achievementId}: `, error);
                // Ideally revert here, but we'll leave optimistic for now
            }
        }
    },

    debugReset: async (achievementId: string) => {
        const { userId, unlockedIds } = get();
        const newUnlocked = new Set(unlockedIds);
        newUnlocked.delete(achievementId);
        set({ unlockedIds: newUnlocked });

        if (userId) {
            const supabase = createClient();
            await supabase.from('user_achievements')
                .delete()
                .eq('user_id', userId)
                .eq('achievement_id', achievementId);
        }
    },

    dismissToast: () => {
        set(state => ({
            toastQueue: state.toastQueue.slice(1)
        }));
    }
}));
