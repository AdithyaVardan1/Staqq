"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Library, BookOpen } from "lucide-react";
import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariant: any = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
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
      {/* ── Ambient background glow ── */}
      <div className={styles.bgGlow1} aria-hidden />
      <div className={styles.bgGlow2} aria-hidden />

      {/* ── Page header ── */}
      <motion.div
        className={styles.pageHeader}
        initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        <div className={styles.headerLeft}>
          {isLoaded && currentStreak > 0 ? (
            <div className={`${styles.headerBadge} ${styles.streakBadge}`}>
              🔥 {currentStreak}-DAY STREAK
            </div>
          ) : (
            <div className={styles.headerBadge}>
              <span className={styles.badgeDot} />
              LEARNING HUB · FREE
            </div>
          )}
          <h1 className={styles.title}>
            Learning<br />
            <span className={styles.accent}>Hub.</span>
          </h1>
          <p className={styles.subtitle}>
            Built for Indian investors who want to actually understand markets — not just follow tips.
          </p>
        </div>

        {/* Right: stat chips grid */}
        <div className={styles.headerRight}>
          <div className={styles.statChip} style={{ gridColumn: '1 / -1' }}>
            <GraduationCap size={13} className={styles.chipIcon} style={{ color: '#22c55e' }} />
            <span className={styles.chipNum}>Free</span>
            <span className={styles.chipLabel}>Forever</span>
          </div>
          <div className={styles.statChip}>
            <Library size={13} className={styles.chipIcon} style={{ color: '#f59e0b' }} />
            <span className={styles.chipNum}>5</span>
            <span className={styles.chipLabel}>Tracks</span>
          </div>
          <div className={styles.statChip}>
            <BookOpen size={13} className={styles.chipIcon} style={{ color: '#a78bfa' }} />
            <span className={styles.chipNum}>83</span>
            <span className={styles.chipLabel}>Lessons</span>
          </div>
        </div>
      </motion.div>

      {/* ── Change 3: Progress section ── */}
      {isLoaded && inProgressEntry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
