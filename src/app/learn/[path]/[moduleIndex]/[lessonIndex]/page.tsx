// 'use client';
// import { learnPaths } from '@/data/learnPaths';

// import { useEffect } from 'react';

// interface LessonPageProps {
//   params: Promise<{
//     path: string;
//     moduleIndex: string;
//     lessonIndex: string;
//   }>;
// }



// export default async function LessonPage({ params }: LessonPageProps) {
//   const { path, moduleIndex, lessonIndex } = await params;

//   const pathData = learnPaths[path];
//   if (!pathData) return <main style={{ padding: '3rem' }}>Path not found</main>;

//   const module = pathData.modules[Number(moduleIndex)];
//   if (!module) return <main style={{ padding: '3rem' }}>Module not found</main>;

//   const lesson = module.lessons[Number(lessonIndex)];
//   if (!lesson) return <main style={{ padding: '3rem' }}>Lesson not found</main>;

//   return (
//     <main style={{ padding: '3rem', maxWidth: '800px' }}>
//       <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
//         {lesson.title}
//       </h1>

//       <p style={{ color: '#9a9a9a', marginBottom: '2rem' }}>
//         Module: {module.title}
//       </p>

//       <article style={{ color: '#cfcfcf', lineHeight: 1.6 }}>
//         <p>
//           Lesson content will go here.
//         </p>
//         <p>
//           This will later be replaced with markdown, videos, or interactive content.
//         </p>
//       </article>
//     </main>
//   );
// }
import { learnPaths } from '@/data/learnPaths';
import LessonClient from './LessonClient';

interface PageProps {
  params: Promise<{
    path: string;
    moduleIndex: string;
    lessonIndex: string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  // ✅ unwrap params (THIS WAS THE BUG)
  const { path, moduleIndex, lessonIndex } = await params;

  const moduleIdx = Number(moduleIndex);
  const lessonIdx = Number(lessonIndex);

  const pathData = learnPaths[path];
  if (!pathData) return <main style={{ padding: '3rem' }}>Path not found</main>;

  const module = pathData.modules[moduleIdx];
  if (!module) return <main style={{ padding: '3rem' }}>Module not found</main>;

  const lesson = module.lessons[lessonIdx];
  if (!lesson) return <main style={{ padding: '3rem' }}>Lesson not found</main>;

  return (
    <LessonClient
      path={path}
      moduleIdx={moduleIdx}
      lessonIdx={lessonIdx}
      lesson={lesson}
      moduleTitle={module.title}
    />
  );
}
