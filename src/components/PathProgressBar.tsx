'use client';

import { useProgress } from '@/hooks/useProgress';

interface PathProgressBarProps {
  pathKey: string;
  totalLessons: number;
}

export default function PathProgressBar({
  pathKey,
  totalLessons,
}: PathProgressBarProps) {
  const { getCompletedCountForPath, isLoaded } = useProgress();
  const completed = getCompletedCountForPath(pathKey);

  const percentage = totalLessons > 0
    ? Math.round((completed / totalLessons) * 100)
    : 0;

  if (!isLoaded) return null;

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
            width: `${percentage}%`,
            background: '#b6ff00',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <p style={{ fontSize: '0.9rem', color: '#9a9a9a' }}>
        {completed} of {totalLessons} lessons completed
      </p>
    </div>
  );
}
