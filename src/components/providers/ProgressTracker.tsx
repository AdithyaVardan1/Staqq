"use client";

import { useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { ACHIEVEMENT_IDS } from '@/lib/achievements';

/**
 * Empty component that initializes useProgress globally
 * to ensure achievement checks run on app load.
 */
export default function ProgressTracker() {
    const { isLoaded, totalCompleted, currentStreak } = useProgress();
    const { unlock } = useAchievementsStore();

    useEffect(() => {
        if (isLoaded) {
            if (totalCompleted >= 1) {
                unlock(ACHIEVEMENT_IDS.FIRST_STACK);
            }
            if (currentStreak >= 7) {
                unlock(ACHIEVEMENT_IDS.EARLY_BIRD);
            }
            if (currentStreak >= 30) {
                unlock(ACHIEVEMENT_IDS.STAQQ_ADDICT);
            }
        }
    }, [isLoaded, totalCompleted, currentStreak, unlock]);

    return null;
}
