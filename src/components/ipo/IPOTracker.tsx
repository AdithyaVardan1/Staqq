"use client";

import { useEffect } from 'react';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { ACHIEVEMENT_IDS } from '@/lib/achievements';

const STORAGE_KEY = 'staqq_viewed_ipos';

export default function IPOTracker({ slug }: { slug: string }) {
    const { unlock } = useAchievementsStore();

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const viewed = stored ? JSON.parse(stored) : [];

            if (!viewed.includes(slug)) {
                const newViewed = [...viewed, slug];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newViewed));

                if (newViewed.length >= 10) {
                    unlock(ACHIEVEMENT_IDS.IPO_WATCHER);
                }
            }
        } catch (e) {
            console.error("Error tracking IPO view:", e);
        }
    }, [slug, unlock]);

    return null; // Invisible component
}
