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
