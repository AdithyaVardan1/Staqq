"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariant: any = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LearnPage() {
  const { getCompletedCountForPath, isLoaded, totalCompleted, currentStreak } = useProgress();

  const inProgressEntry = isLoaded
    ? Object.entries(learnPaths).find(([key, path]) => {
        const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
        const done = getCompletedCountForPath(key);
        return done > 0 && done < total;
      })
    : null;

  const isNewUser = isLoaded && totalCompleted === 0;

  return (
    <main className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.pageHeader}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Learning Hub</h1>
          <p className={styles.pageSubtitle}>5 tracks · 83 lessons · free forever</p>
        </div>

        {isLoaded && currentStreak > 0 && (
          <div className={styles.streakChip}>🔥 {currentStreak}-day streak</div>
        )}
      </motion.div>

      {/* Nudges */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/learn/beginner" className={styles.nudge}>
            <span className={styles.nudgeIcon}>👋</span>
            <span className={styles.nudgeText}>
              New here? <strong>Absolute Beginner</strong> is the right place to start — 15 lessons, no prior knowledge needed.
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      )}

      {inProgressEntry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={`/learn/${inProgressEntry[0]}`} className={`${styles.nudge} ${styles.nudgeContinue}`}>
            <span className={styles.continueDot} />
            <span className={styles.nudgeText}>
              Continue <strong>{inProgressEntry[1].title}</strong> —{" "}
              {getCompletedCountForPath(inProgressEntry[0])} of{" "}
              {inProgressEntry[1].modules.reduce((s, m) => s + m.chapterCount, 0)} lessons done
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      <motion.section
        className={styles.grid}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {Object.entries(learnPaths).map(([key, path]) => {
          const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
          const completed = isLoaded ? getCompletedCountForPath(key) : 0;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          const firstLesson = path.modules[0]?.firstLesson?.title;

          return (
            <motion.div key={key} variants={cardVariant}>
              <LearningPathCard
                title={path.title}
                description={path.description}
                modules={path.modules.length}
                progress={progress}
                slug={key}
                difficulty={path.difficulty}
                estimatedTime={path.estimatedTime}
                icon={path.icon}
                color={path.color}
                firstLesson={firstLesson}
              />
            </motion.div>
          );
        })}
      </motion.section>
    </main>
  );
}
