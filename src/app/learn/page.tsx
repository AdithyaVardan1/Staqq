"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariant: any = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function LearnPage() {
  const {
    getCompletedCountForPath,
    getCompletedCountForModule,
    isLoaded,
    totalCompleted,
    currentStreak,
  } = useProgress();

  // Find first in-progress track
  const inProgressEntry = isLoaded
    ? Object.entries(learnPaths).find(([key, path]) => {
        const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
        const done = getCompletedCountForPath(key);
        return done > 0 && done < total;
      })
    : null;

  // Find the module currently being worked on
  let inProgressModuleName: string | null = null;
  if (inProgressEntry) {
    const [key, path] = inProgressEntry;
    const mod =
      path.modules.find((m) => {
        const done = getCompletedCountForModule(key, m.slug);
        return done > 0 && done < m.chapterCount;
      }) ?? path.modules.find((m) => getCompletedCountForModule(key, m.slug) < m.chapterCount);
    inProgressModuleName = mod?.title ?? null;
  }

  const isNewUser = isLoaded && totalCompleted === 0;

  // Split paths: featured (beginner) + remaining 4
  const pathEntries = Object.entries(learnPaths);
  const featuredEntry = pathEntries.find(([key]) => key === "beginner")!;
  const restEntries = pathEntries.filter(([key]) => key !== "beginner");

  function cardProps(key: string, path: (typeof learnPaths)[string]) {
    const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
    const completed = isLoaded ? getCompletedCountForPath(key) : 0;
    return {
      title: path.title,
      description: path.description,
      modules: path.modules.length,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      slug: key,
      difficulty: path.difficulty,
      estimatedTime: path.estimatedTime,
      icon: path.icon,
      color: path.color,
      firstLesson: path.modules[0]?.firstLesson?.title,
    };
  }

  return (
    <main className={styles.page}>
      {/* ── Page header ── */}
      <motion.div
        className={styles.pageHeader}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Learning Hub</h1>
            {isLoaded && currentStreak > 0 && (
              <span className={styles.streakChip}>🔥 {currentStreak}-day streak</span>
            )}
          </div>
          {/* Change 6: social proof subtitle */}
          <p className={styles.socialProof}>
            Built for Indian investors who want to actually understand markets — not just follow tips.
          </p>
        </div>

        {/* Change 2: stat pill badges */}
        <div className={styles.statPills}>
          <span className={`${styles.pill} ${styles.pillLime}`}>🎓 Free Forever</span>
          <span className={styles.pill}>5 Tracks</span>
          <span className={styles.pill}>83 Lessons</span>
        </div>
      </motion.div>

      {/* ── Change 3: Progress section ── */}
      {isLoaded && inProgressEntry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {(() => {
            const [key, path] = inProgressEntry;
            const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
            const done = getCompletedCountForPath(key);
            const pct = Math.round((done / total) * 100);
            return (
              <div className={styles.progressCard}>
                <div className={styles.progressCardLeft}>
                  <div className={styles.progressCardTitle}>Continue where you left off</div>
                  <div className={styles.progressCardTrack}>
                    {path.title}
                    {inProgressModuleName && (
                      <span className={styles.progressCardModule}> · {inProgressModuleName}</span>
                    )}
                  </div>
                  <div className={styles.progressBarWrap}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.progressPct}>{pct}%</span>
                  </div>
                  {currentStreak > 0 && (
                    <span className={styles.streakInline}>🔥 {currentStreak}-day streak</span>
                  )}
                </div>
                <Link href={`/learn/${key}`} className={styles.continueBtn}>
                  Continue →
                </Link>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* "New here?" nudge for first-time visitors */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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

      {/* ── Change 1: Featured hero card + 2×2 grid ── */}
      <motion.div
        className={styles.grid}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Featured card — spans both columns */}
        <motion.div key={featuredEntry[0]} variants={cardVariant} className={styles.featuredSlot}>
          <LearningPathCard
            {...cardProps(featuredEntry[0], featuredEntry[1])}
            featured
          />
        </motion.div>

        {/* Remaining 4 in 2×2 */}
        {restEntries.map(([key, path]) => (
          <motion.div key={key} variants={cardVariant}>
            <LearningPathCard {...cardProps(key, path)} />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
