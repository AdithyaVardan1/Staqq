// import { learnPaths } from '@/data/learnPaths';
// import ModulesAccordion from '@/components/ModulesAccordion';
// import PathProgressBar from '@/components/PathProgressBar';

// interface LearnPathPageProps {
//   params: Promise<{
//     path: string;
//   }>;
// }

// export default async function LearnPathPage({ params }: LearnPathPageProps) {
//   const { path } = await params;
//   const pathData = learnPaths[path];

//   if (!pathData) {
//     return <main style={{ padding: '3rem' }}>Path not found</main>;
//   }

//   const totalLessons = pathData.modules.reduce(
//   (sum, module) => sum + module.lessons.length,
//   0
// );


//   return (
//     <main style={{ padding: '3rem', maxWidth: '900px' }}>
//       <h1 style={{ fontSize: '2.4rem' }}>{pathData.title}</h1>
//       <p style={{ color: '#bdbdbd', marginBottom: '2rem' }}>
//         {pathData.description}
//       </p>

//       <ModulesAccordion
//   modules={pathData.modules}
//   pathKey={path}
// />

// <PathProgressBar
//   pathKey={path}
//   totalLessons={totalLessons}
// />


//     </main>
//   );
// }
import { learnPaths } from '@/data/learnPaths';
import ModulesAccordion from '@/components/ModulesAccordion';
import PathProgressBar from '@/components/PathProgressBar';

interface LearnPathPageProps {
  params: Promise<{
    path: string;
  }>;
}

import Link from 'next/link';
import styles from './page.module.css';

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { path } = await params;

  const pathData = learnPaths[path as keyof typeof learnPaths];

  if (!pathData) {
    return <main style={{ padding: '3rem' }}>Path not found</main>;
  }

  const totalLessons = pathData.modules.reduce((sum, module) => sum + module.chapterCount, 0);

  return (
    <main className={styles.container}>
      <Link href="/learn" className={styles.backLink}>
        Back to Paths
      </Link>
      <h1 style={{ fontSize: '2.4rem' }}>{pathData.title}</h1>

      <p style={{ color: '#bdbdbd', marginBottom: '2rem' }}>
        {pathData.description}
      </p>

      {/* 🔥 This is where module slugs matter */}
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
