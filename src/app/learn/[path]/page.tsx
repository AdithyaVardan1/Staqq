import { learnPaths } from '@/data/learnPaths';
import ModulesAccordion from '@/components/ModulesAccordion';
import PathProgressBar from '@/components/PathProgressBar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

interface LearnPathPageProps {
  params: Promise<{
    path: string;
  }>;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  BEGINNER: '#b6ff00',
  INTERMEDIATE: '#ffcc00',
  ADVANCED: '#ff6b35',
};

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { path } = await params;

  const pathData = learnPaths[path as keyof typeof learnPaths];

  if (!pathData) {
    return <main style={{ padding: '3rem' }}>Path not found</main>;
  }

  const totalLessons = pathData.modules.reduce((sum, module) => sum + module.chapterCount, 0);
  const diffColor = DIFFICULTY_COLOR[pathData.difficulty] || '#b6ff00';

  return (
    <main className={styles.container}>
      <Link href="/learn" className={styles.backLink}>
        <ArrowLeft strokeWidth={2.5} size={16} />
        All tracks
      </Link>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBadge} style={{ color: diffColor, borderColor: `${diffColor}40`, background: `${diffColor}0d` }}>
          {DIFFICULTY_LABEL[pathData.difficulty]}
        </div>

        <h1 className={styles.heroTitle}>{pathData.title}</h1>
        <p className={styles.heroDesc}>{pathData.description}</p>

        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            {pathData.modules.length} modules
          </span>
          <span className={styles.heroMetaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            {totalLessons} lessons
          </span>
          <span className={styles.heroMetaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {pathData.estimatedTime}
          </span>
        </div>

        <div className={styles.progressWrap}>
          <PathProgressBar pathKey={path} totalLessons={totalLessons} />
        </div>
      </div>

      {/* Module list */}
      <div className={styles.moduleSection}>
        <h2 className={styles.sectionLabel}>Modules</h2>
        <ModulesAccordion modules={pathData.modules} pathKey={path} />
      </div>
    </main>
  );
}
