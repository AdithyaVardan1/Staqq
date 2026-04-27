"use client";

import styles from "./page.module.css";
import LearningPathCard from "@/components/LearnPathCard/LearnPathCard";
import { learnPaths } from "@/data/learnPaths";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";

const RECOMMENDED_PATH = "beginner";

export default function LearnPage() {
  const { getCompletedCountForPath, isLoaded, totalCompleted, currentStreak } = useProgress();

  const inProgressPath = isLoaded
    ? Object.entries(learnPaths).find(([key, path]) => {
        const total = path.modules.reduce((s, m) => s + m.chapterCount, 0);
        const done = getCompletedCountForPath(key);
        return done > 0 && done < total;
      })
    : null;

  const isNewUser = isLoaded && totalCompleted === 0;

  return (
    <div className={styles.page}>
      {/* Ambient glows */}
      <div className={styles.glowLime} aria-hidden />
      <div className={styles.glowViolet} aria-hidden />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Learning Hub · Free forever
        </div>

        <h1 className={styles.heroTitle}>
          Master the markets,<br />
          <span className={styles.heroAccent}>one lesson at a time.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Five structured tracks from opening your first demat account to reading a DCF model.
          No fluff, no paywall.
        </p>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          {[
            { num: "5", label: "Tracks" },
            { num: "22", label: "Modules" },
            { num: "83", label: "Lessons" },
            isLoaded && totalCompleted > 0
              ? { num: String(totalCompleted), label: "Completed" }
              : { num: "100%", label: "Free" },
          ].map((s, i) => (
            <div key={s.label} className={styles.statCell}>
              {i > 0 && <div className={styles.statDivider} />}
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak — visible once user starts */}
        {isLoaded && currentStreak > 0 && (
          <div className={styles.streakPill}>
            🔥 {currentStreak}-day streak
          </div>
        )}
      </section>

      {/* Main content */}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Contextual banner */}
        {isNewUser && (
          <Link href={`/learn/${RECOMMENDED_PATH}`} className={styles.startBanner}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerIcon}>👋</div>
              <div>
                <div className={styles.bannerTitle}>New here? Start with Absolute Beginner</div>
                <div className={styles.bannerSub}>15 bite-sized lessons, no prior knowledge needed.</div>
              </div>
            </div>
            <svg className={styles.bannerArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        )}

        {inProgressPath && (
          <Link href={`/learn/${inProgressPath[0]}`} className={`${styles.startBanner} ${styles.continueBanner}`}>
            <div className={styles.bannerLeft}>
              <div className={styles.continueDot} />
              <div>
                <div className={styles.bannerTitle}>Continue: {inProgressPath[1].title}</div>
                <div className={styles.bannerSub}>
                  {getCompletedCountForPath(inProgressPath[0])} of{" "}
                  {inProgressPath[1].modules.reduce((s, m) => s + m.chapterCount, 0)} lessons done
                </div>
              </div>
            </div>
            <svg className={styles.bannerArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        )}

        {/* Section header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>All tracks</span>
        </div>

        {/* Grid */}
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
      </div>
    </div>
  );
}
