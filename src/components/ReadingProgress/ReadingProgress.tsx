'use client';

import { useEffect, useState } from 'react';
import styles from './ReadingProgress.module.css';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className={styles.track} aria-hidden>
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  );
}
