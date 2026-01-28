interface LearnProgress {
  [pathKey: string]: {
    completedLessons?: Record<number, number>;
  };
}

export function getPathSummary(
  pathKey: string,
  totalLessons: number
): number {
  if (typeof window === 'undefined') return 0;

  const raw = localStorage.getItem('learn-progress');
  if (!raw) return 0;

  const data: LearnProgress = JSON.parse(raw);
  const completedLessonsByModule =
    data[pathKey]?.completedLessons ?? {};

  const completed = Object.values(completedLessonsByModule).reduce(
    (sum, count) => sum + count,
    0
  );

  return totalLessons === 0
    ? 0
    : Math.min(100, Math.round((completed / totalLessons) * 100));
}
