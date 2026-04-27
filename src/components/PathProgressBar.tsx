'use client';

import { useProgress } from '@/hooks/useProgress';
import styles from './PathProgressBar.module.css';

interface PathProgressBarProps {
  pathKey: string;
  totalLessons: number;
}

export default function PathProgressBar({ pathKey, totalLessons }: PathProgressBarProps) {
  const { getCompletedCountForPath, isLoaded } = useProgress();
  const completed = isLoaded ? getCompletedCountForPath(pathKey) : 0;
  const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      <p className={styles.label}>
        {isLoaded ? `${completed} of ${totalLessons} lessons completed` : `${totalLessons} lessons`}
      </p>
    </div>
  );
}
