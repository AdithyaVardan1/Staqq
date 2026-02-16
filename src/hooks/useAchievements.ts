"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Achievement, fetchAchievements, fetchUserAchievements } from '@/lib/achievements';

export function useAchievements() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return; // Or handle guest mode later

                const [all, userUnlocked] = await Promise.all([
                    fetchAchievements(),
                    fetchUserAchievements(user.id)
                ]);

                setAchievements(all || []);
                setUnlockedIds(new Set(userUnlocked?.map(u => u.achievement_id) || []));
            } catch (e) {
                console.error("Failed to load achievements", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const unlock = useCallback(async (achievementId: string) => {
        if (loading) return;
        if (unlockedIds.has(achievementId)) return; // Already unlocked

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Must be logged in

        // Optimistic update
        setUnlockedIds(prev => new Set(prev).add(achievementId));

        // Find details for toast
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
            setNewlyUnlocked(achievement);
            // Auto-clear toast after 3s
            setTimeout(() => setNewlyUnlocked(null), 5000);
        }

        // Persist
        const { error } = await supabase
            .from('user_achievements')
            .insert({ user_id: user.id, achievement_id: achievementId });

        if (error) {
            console.error("Error unlocking achievement:", error);
            // Revert if failed? simplified: just log for now
        }
    }, [unlockedIds, achievements, loading]);

    const clearToast = useCallback(() => setNewlyUnlocked(null), []);

    return {
        achievements,
        unlockedIds,
        unlock,
        loading,
        newlyUnlocked,
        clearToast
    };
}
