"use client";

import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";

const RECOMMENDED_PATH = "beginner";

export default function LearnPage() {
  const {
    getCompletedCountForPath,
    isLoaded,
    totalCompleted,
    currentStreak,
  } = useProgress();

  // Find a path the user is currently in the middle of (started but not finished)
  const inProgressPath = isLoaded
    ? Object.entries(learnPaths).find(([key, path]) => {
        const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
        const done = getCompletedCountForPath(key);
        return done > 0 && done < total;
      })
    : null;

  const isNewUser = isLoaded && totalCompleted === 0;

  return (
    <main className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <div className={styles.eyebrow}>Learning Hub</div>
            <h1 className={styles.title}>
              Master the markets,<br />one lesson at a time.
            </h1>
            <p className={styles.subtitle}>
              Five structured tracks covering everything from opening your first demat
              account to reading a DCF model. No fluff, no paywall.
            </p>
          </div>

          {/* Streak card — only once they've started */}
          {isLoaded && currentStreak > 0 && (
            <div className={styles.streakCard}>
              <div className={styles.streakFlame}>🔥</div>
              <div className={styles.streakNum}>{currentStreak}</div>
              <div className={styles.streakLabel}>day streak</div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          {[
            { num: "5", label: "Tracks" },
            { num: "22", label: "Modules" },
            { num: "83", label: "Lessons" },
            isLoaded && totalCompleted > 0
              ? { num: String(totalCompleted), label: "Completed" }
              : { num: "Free", label: "Always" },
          ].map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual CTA banner */}
      {isNewUser && (
        <Link href={`/learn/${RECOMMENDED_PATH}`} className={styles.startBanner}>
          <div className={styles.startBannerLeft}>
            <span className={styles.startBannerIcon}>👋</span>
            <div>
              <div className={styles.startBannerTitle}>New here? Start with Absolute Beginner</div>
              <div className={styles.startBannerSub}>15 bite-sized lessons, no prior knowledge needed.</div>
            </div>
          </div>
          <svg className={styles.startBannerArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}

      {inProgressPath && (
        <Link href={`/learn/${inProgressPath[0]}`} className={styles.continueBanner}>
          <div className={styles.continueBannerLeft}>
            <span className={styles.continueDot} />
            <div>
              <div className={styles.continueBannerTitle}>Continue: {inProgressPath[1].title}</div>
              <div className={styles.continueBannerSub}>
                {getCompletedCountForPath(inProgressPath[0])} of{" "}
                {inProgressPath[1].modules.reduce((s, m) => s + m.chapterCount, 0)} lessons done
              </div>
            </div>
          </div>
          <svg className={styles.startBannerArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}

      {/* Section label */}
      <div className={styles.sectionLabel}>All tracks</div>

      {/* Path cards */}
      <section className={styles.grid}>
        {Object.entries(learnPaths).map(([key, path]) => {
          const totalLessons = path.modules.reduce((sum, m) => sum + m.chapterCount, 0);
          const completed = isLoaded ? getCompletedCountForPath(key) : 0;
          const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

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
