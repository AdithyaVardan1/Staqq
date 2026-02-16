import Link from 'next/link';
import styles from './LearnPathCard.module.css';
import { Sprout, BarChart3, CandlestickChart, Rocket, Building2, Clock, BookOpen, ArrowRight } from 'lucide-react';

const ICONS: Record<string, any> = {
  Sprout, BarChart3, CandlestickChart, Rocket, Building2
};

interface LearningPathCardProps {
  title: string;
  description: string;
  modules: number;
  progress: number;
  slug: string;
  difficulty?: string;
  duration?: string;
  color?: string;
  icon?: string;
}

export default function LearningPathCard({
  title,
  description,
  modules,
  progress,
  slug,
  difficulty = 'Beginner',
  duration = '2h',
  color = 'from-gray-500 to-gray-700',
  icon = 'Sprout',
}: LearningPathCardProps) {
  const IconComponent = ICONS[icon] || Sprout;

  return (
    <Link href={`/learn/${slug}`} className={styles.card}>
      {/* Creative Background Icon */}
      <div className={styles.bgIcon}>
        <IconComponent strokeWidth={1} />
      </div>

      {/* Hover Arrow */}
      <div className={styles.arrowWrapper}>
        <div className={`${styles.arrow} bg-gradient-to-r ${color}`}>
          <ArrowRight size={18} color="white" />
        </div>
      </div>

      <div className={`${styles.header} bg-gradient-to-br ${color}`}>
        <div className={styles.iconWrapper}>
          <IconComponent size={28} color="white" />
        </div>
        <span className={styles.difficulty}>{difficulty}</span>
      </div>

      <div className={styles.content}>
        <h3>{title}</h3>
        <p className={styles.desc}>{description}</p>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <BookOpen size={14} />
            <span>{modules} modules</span>
          </div>
          <div className={styles.metaItem}>
            <Clock size={14} />
            <span>{duration}</span>
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
