'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/* ---------- Types ---------- */

interface Lesson {
  title: string;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

interface ModulesAccordionProps {
  modules: Module[];
  pathKey: string;
}

/* ---------- Lesson Progress Helpers ---------- */

function getLessonProgress(pathKey: string, moduleIndex: number) {
  if (typeof window === 'undefined') return 0;

  const raw = localStorage.getItem('learn-progress');
  if (!raw) return 0;

  const data = JSON.parse(raw);
  return data[pathKey]?.completedLessons?.[moduleIndex] ?? 0;
}

/* ---------- Component ---------- */

export default function ModulesAccordion({
  modules,
  pathKey,
}: ModulesAccordionProps) {
  const [openModule, setOpenModule] = useState<number | null>(null);

  return (
    <>
      {modules.map((module, moduleIndex) => {
        const completedLessons = getLessonProgress(pathKey, moduleIndex);

        return (
          <div
            key={moduleIndex}
            onClick={() =>
              setOpenModule(
                openModule === moduleIndex ? null : moduleIndex
              )
            }
            style={{
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: '1rem',
              cursor: 'pointer',
              background: '#111',
            }}
          >
            {/* Module Header */}
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>
              Module {moduleIndex + 1}: {module.title}
            </h2>

            <p style={{ color: '#9a9a9a', fontSize: '0.95rem' }}>
              {module.description}
            </p>

            {/* Progress */}
            <p style={{ fontSize: '0.85rem', color: '#777' }}>
              {completedLessons} / {module.lessons.length} lessons completed
            </p>

            {/* Lessons */}
            {openModule === moduleIndex && (
              <ul style={{ marginTop: '0.8rem', paddingLeft: '1.2rem' }}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCompleted =
                    lessonIndex < completedLessons;

                  return (
                    <li
                      key={lessonIndex}
                      style={{
                        marginBottom: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>{isCompleted ? '✓' : '•'}</span>

                      <Link
                        href={`/learn/${pathKey}/${moduleIndex}/${lessonIndex}`}
                        style={{
                          color: isCompleted ? '#9fff00' : '#cfcfcf',
                          textDecoration: 'none',
                        }}
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}
