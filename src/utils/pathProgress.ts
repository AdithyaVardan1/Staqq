interface PathProgress {
  completed: number;
  percentage: number;
}

export function getPathProgress(
  pathKey: string,
  totalLessons: number
): PathProgress {
  if (typeof window === 'undefined') {
    return { completed: 0, percentage: 0 };
  }

  const raw = localStorage.getItem('learn-progress');
  if (!raw) {
    return { completed: 0, percentage: 0 };
  }

  const data: {
    [key: string]: {
      completedLessons?: Record<number, number>;
    };
  } = JSON.parse(raw);

  const completedLessonsByModule =
    data[pathKey]?.completedLessons ?? {};

  const completed = Object.values(completedLessonsByModule).reduce(
    (sum, count) => sum + count,
    0
  );

  const percentage =
    totalLessons === 0
      ? 0
      : Math.min(100, Math.round((completed / totalLessons) * 100));

  return { completed, percentage };
}
