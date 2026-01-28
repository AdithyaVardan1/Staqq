'use client';

import { useEffect, useState } from 'react';
import { getPathProgress } from '@/utils/pathProgress';

interface PathProgressBarProps {
  pathKey: string;
  totalLessons: number;
}

interface ProgressState {
  completed: number;
  percentage: number;
}

export default function PathProgressBar({
  pathKey,
  totalLessons,
}: PathProgressBarProps) {
  const [progress, setProgress] = useState<ProgressState>({
    completed: 0,
    percentage: 0,
  });

  useEffect(() => {
    setProgress(getPathProgress(pathKey, totalLessons));
  }, [pathKey, totalLessons]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          height: '8px',
          background: '#222',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '0.4rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress.percentage}%`,
            background: '#b6ff00',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <p style={{ fontSize: '0.9rem', color: '#9a9a9a' }}>
        {progress.completed} of {totalLessons} lessons completed
      </p>
    </div>
  );
}
