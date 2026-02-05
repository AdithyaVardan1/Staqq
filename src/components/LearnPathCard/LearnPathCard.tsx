import Link from 'next/link';
import styles from './LearnPathCard.module.css';

interface LearningPathCardProps {
  title: string;
  description: string;
  modules: number;
  progress: number;
  slug: string;
}

export default function LearningPathCard({
  title,
  description,
  modules,
  progress,
  slug,
}: LearningPathCardProps) {
  return (
    <Link href={`/learn/${slug}`} className={styles.card}>
      <h3>{title}</h3>
      <p className={styles.desc}>{description}</p>

      <div className={styles.meta}>
        <span>{modules} modules</span>
        <span>{progress}% completed</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}


