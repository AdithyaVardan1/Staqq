import Link from "next/link";
import styles from "./LearnPathCard.module.css";
import type { Difficulty } from "@/data/learnPaths";

interface LearningPathCardProps {
  title: string;
  description: string;
  modules: number;
  progress: number;
  slug: string;
  difficulty: Difficulty;
  estimatedTime: string;
  icon: string;
}

function PathIcon({ name }: { name: string }) {
  switch (name) {
    case "sprout":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V12" />
          <path d="M12 12C12 7 8 4 4 4c0 4 2.5 8 8 8z" />
          <path d="M12 12c0-5 4-8 8-8 0 4-2.5 8-8 8z" />
        </svg>
      );
    case "chart-bar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      );
    case "chart-candlestick":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="2" x2="6" y2="22" />
          <rect x="4" y="6" width="4" height="8" rx="1" />
          <line x1="14" y1="4" x2="14" y2="20" />
          <rect x="12" y="8" width="4" height="7" rx="1" />
        </svg>
      );
    case "rocket":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l3-3-3-3-3 3z" />
          <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
          <rect x="13" y="13" width="3" height="3" />
          <rect x="5" y="13" width="3" height="3" />
          <rect x="5" y="5" width="3" height="2" />
          <rect x="11" y="5" width="3" height="2" />
          <rect x="17" y="5" width="2" height="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
  }
}

const difficultyColor: Record<Difficulty, string> = {
  BEGINNER: styles.badgeBeginner,
  INTERMEDIATE: styles.badgeIntermediate,
  ADVANCED: styles.badgeAdvanced,
};

export default function LearningPathCard({
  title,
  description,
  modules,
  progress,
  slug,
  difficulty,
  estimatedTime,
  icon,
}: LearningPathCardProps) {
  return (
    <Link href={`/learn/${slug}`} className={styles.card}>
      {/* Top row: icon + difficulty badge */}
      <div className={styles.topRow}>
        <div className={styles.iconWrapper}>
          <PathIcon name={icon} />
        </div>
        <span className={`${styles.badge} ${difficultyColor[difficulty]}`}>
          {difficulty}
        </span>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
      </div>

      {/* Meta: modules count + time */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          {modules} modules
        </span>
        <span className={styles.metaItem}>
          <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {estimatedTime}
        </span>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Decorative background icon */}
      <div className={styles.bgIcon} aria-hidden="true">
        <PathIcon name={icon} />
      </div>

      {/* Hover arrow */}
      <div className={styles.hoverArrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </Link>
  );
}
