'use client';

import { useEffect } from 'react';

interface LessonClientProps {
  path: string;
  moduleIdx: number;
  lessonIdx: number;
  lesson: {
    title: string;
  };
  moduleTitle: string;
}

export default function LessonClient({
  path,
  moduleIdx,
  lessonIdx,
  lesson,
  moduleTitle,
}: LessonClientProps) {
  useEffect(() => {
    const raw = localStorage.getItem('learn-progress');
    const data = raw ? JSON.parse(raw) : {};

    // ✅ GUARANTEE OBJECT SHAPE
    if (!data[path]) {
      data[path] = {};
    }

    if (!data[path].completedLessons) {
      data[path].completedLessons = {};
    }

    const current = data[path].completedLessons[moduleIdx] ?? 0;

    if (lessonIdx + 1 > current) {
      data[path].completedLessons[moduleIdx] = lessonIdx + 1;
      localStorage.setItem('learn-progress', JSON.stringify(data));
    }
  }, [path, moduleIdx, lessonIdx]);

  return (
    <main style={{ padding: '3rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.2rem' }}>{lesson.title}</h1>

      <p style={{ color: '#9a9a9a', marginBottom: '2rem' }}>
        Module: {moduleTitle}
      </p>

      <article style={{ color: '#cfcfcf', lineHeight: 1.6 }}>
        <p>Lesson content goes here.</p>
      </article>
    </main>
  );
}
