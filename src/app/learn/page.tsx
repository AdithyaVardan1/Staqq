"use client";

import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";

const STATS = [
  { num: "5", label: "Learning Tracks" },
  { num: "22", label: "Modules" },
  { num: "83", label: "Lessons" },
  { num: "Free", label: "Always" },
];

export default function LearnPage() {
  const { getCompletedCountForPath, isLoaded, totalCompleted } = useProgress();

  return (
    <main className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Learning Hub</div>
        <h1 className={styles.title}>Master the markets,<br />one lesson at a time.</h1>
        <p className={styles.subtitle}>
          Five structured tracks covering everything from opening your first demat account
          to reading a DCF model. No fluff, no paywall.
        </p>

        <div className={styles.statsRow}>
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* In-progress banner */}
      {isLoaded && totalCompleted > 0 && (
        <div className={styles.progressBanner}>
          <span className={styles.progressBannerDot} />
          <span className={styles.progressBannerText}>
            {totalCompleted} lesson{totalCompleted !== 1 ? "s" : ""} completed. Keep going.
          </span>
        </div>
      )}

      {/* Path cards */}
      <section className={styles.grid}>
        {Object.entries(learnPaths).map(([key, path]) => {
          const totalLessons = path.modules.reduce(
            (sum, m) => sum + m.chapterCount,
            0
          );
          const completed = isLoaded ? getCompletedCountForPath(key) : 0;
          const progress =
            totalLessons > 0
              ? Math.round((completed / totalLessons) * 100)
              : 0;

          return (
            <LearningPathCard
              key={key}
              title={path.title}
              description={path.description}
              modules={path.modules.length}
              progress={progress}
              slug={key}
              difficulty={path.difficulty}
              estimatedTime={path.estimatedTime}
              icon={path.icon}
            />
          );
        })}
      </section>
    </main>
  );
}
