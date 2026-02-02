"use client";

import { useProgress } from "@/hooks/useProgress";
import styles from "./StreakCounter.module.css";

interface StreakCounterProps {
    path?: string;
    totalLessons?: number;
}

export function StreakCounter({ path, totalLessons }: StreakCounterProps) {
    const {
        currentStreak,
        totalCompleted,
        getCompletedCountForPath,
        isLoaded
    } = useProgress();

    if (!isLoaded) {
        return null;
    }

    const completed = path ? getCompletedCountForPath(path) : totalCompleted;
    const total = totalLessons || 80; // Default to total lessons

    return (
        <div className={styles.container}>
            <div className={styles.lessonsInfo}>
                <span className={styles.count}>{completed}</span>
                <span className={styles.separator}>of</span>
                <span className={styles.total}>{total}</span>
                <span className={styles.label}>lessons completed</span>
            </div>

            {currentStreak > 0 && (
                <div className={styles.streak}>
                    <span className={styles.fire}>🔥</span>
                    <span className={styles.streakText}>
                        {currentStreak} day{currentStreak !== 1 ? "s" : ""} streak!
                    </span>
                </div>
            )}
        </div>
    );
}
