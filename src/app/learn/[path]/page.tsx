import { learnPaths } from '@/data/learnPaths';
import ModulesAccordion from '@/components/ModulesAccordion';
import PathProgressBar from '@/components/PathProgressBar';

interface LearnPathPageProps {
  params: Promise<{
    path: string;
  }>;
}

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { path } = await params;
  const pathData = learnPaths[path];

  if (!pathData) {
    return <main style={{ padding: '3rem' }}>Path not found</main>;
  }

  const totalLessons = pathData.modules.reduce(
  (sum, module) => sum + module.lessons.length,
  0
);


  return (
    <main style={{ padding: '3rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2.4rem' }}>{pathData.title}</h1>
      <p style={{ color: '#bdbdbd', marginBottom: '2rem' }}>
        {pathData.description}
      </p>

      <ModulesAccordion
  modules={pathData.modules}
  pathKey={path}
/>

<PathProgressBar
  pathKey={path}
  totalLessons={totalLessons}
/>


    </main>
  );
}
