"use client";

import { useState, useEffect, useCallback } from "react";
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { ACHIEVEMENT_IDS } from '@/lib/achievements';

interface ProgressData {
    completedLessons: string[]; // Array of "path/module/chapter" slugs
    lastActivityDate: string; // ISO date string
    currentStreak: number;
    longestStreak: number;
}

const STORAGE_KEY = "staqq_progress";

function getDefaultProgress(): ProgressData {
    return {
        completedLessons: [],
        lastActivityDate: "",
        currentStreak: 0,
        longestStreak: 0,
    };
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function isYesterday(date1: Date, date2: Date): boolean {
    const yesterday = new Date(date2);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date1, yesterday);
}

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData>(getDefaultProgress);
    const [isLoaded, setIsLoaded] = useState(false);
    const { unlock } = useAchievementsStore();

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as ProgressData;

                // Check and update streak
                const today = new Date();
                const lastActivity = parsed.lastActivityDate
                    ? new Date(parsed.lastActivityDate)
                    : null;

                if (lastActivity) {
                    if (!isSameDay(lastActivity, today) && !isYesterday(lastActivity, today)) {
                        // Streak broken - reset
                        parsed.currentStreak = 0;
                    }
                }

                setProgress(parsed);
            }
        } catch (e) {
            console.error("Error loading progress:", e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever progress changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
    }, [progress, isLoaded]);



    const markLessonComplete = useCallback((path: string, moduleSlug: string, chapterSlug: string) => {
        const lessonKey = `${path}/${moduleSlug}/${chapterSlug}`;

        setProgress((prev) => {
            if (prev.completedLessons.includes(lessonKey)) {
                return prev; // Already completed
            }

            const today = new Date();
            const lastActivity = prev.lastActivityDate
                ? new Date(prev.lastActivityDate)
                : null;

            let newStreak = prev.currentStreak;

            if (!lastActivity || !isSameDay(lastActivity, today)) {
                // New day of activity
                if (lastActivity && isYesterday(lastActivity, today)) {
                    // Continuing streak
                    newStreak = prev.currentStreak + 1;
                } else if (!lastActivity || !isYesterday(lastActivity, today)) {
                    // Starting new streak (or first activity)
                    newStreak = 1;
                }
            }

            // Check for achievements
            // 1. First Stack (1 completed lesson)
            if (prev.completedLessons.length === 0) { // 0 means this is the first one
                unlock(ACHIEVEMENT_IDS.FIRST_STACK);
            }

            // 2. Early Bird (7 day streak)
            if (newStreak >= 7) {
                unlock(ACHIEVEMENT_IDS.EARLY_BIRD);
            }

            // 3. Staqq Addict (30 day streak)
            if (newStreak >= 30) {
                unlock(ACHIEVEMENT_IDS.STAQQ_ADDICT);
            }

            return {
                completedLessons: [...prev.completedLessons, lessonKey],
                lastActivityDate: today.toISOString(),
                currentStreak: newStreak,
                longestStreak: Math.max(prev.longestStreak, newStreak),
            };
        });
    }, []);

    const isLessonComplete = useCallback(
        (path: string, moduleSlug: string, chapterSlug: string): boolean => {
            const lessonKey = `${path}/${moduleSlug}/${chapterSlug}`;
            return progress.completedLessons.includes(lessonKey);
        },
        [progress.completedLessons]
    );

    const getCompletedCountForPath = useCallback(
        (path: string): number => {
            return progress.completedLessons.filter((lesson) =>
                lesson.startsWith(`${path}/`)
            ).length;
        },
        [progress.completedLessons]
    );

    const getCompletedCountForModule = useCallback(
        (path: string, moduleSlug: string): number => {
            return progress.completedLessons.filter((lesson) =>
                lesson.startsWith(`${path}/${moduleSlug}/`)
            ).length;
        },
        [progress.completedLessons]
    );

    const resetProgress = useCallback(() => {
        setProgress(getDefaultProgress());
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        isLoaded,
        completedLessons: progress.completedLessons,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        totalCompleted: progress.completedLessons.length,
        markLessonComplete,
        isLessonComplete,
        getCompletedCountForPath,
        getCompletedCountForModule,
        resetProgress,
    };
}
