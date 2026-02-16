"use client";

import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";

export default function LearnPage() {
  const { getCompletedCountForPath, isLoaded } = useProgress();

  if (!isLoaded) return null;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Investment <span className="text-brand">Learning Hub</span></h1>
      <p className={styles.subtitle}>
        Master the stock market, step by step.
      </p>

      <section className={styles.grid}>
        {Object.entries(learnPaths).map(([key, path]) => {
          const totalLessons = path.modules.reduce(
            (sum, m) => sum + m.chapterCount,
            0
          );
          const completed = getCompletedCountForPath(key);
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
              duration={path.duration}
              color={path.color}
              icon={path.icon}
            />
          );
        })}
      </section>
    </main>
  );
}
