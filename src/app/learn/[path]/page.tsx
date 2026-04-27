import { learnPaths } from '@/data/learnPaths';
import ModulesAccordion from '@/components/ModulesAccordion';
import PathProgressBar from '@/components/PathProgressBar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

interface LearnPathPageProps {
  params: Promise<{ path: string }>;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const DIFFICULTY_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  BEGINNER:     { text: '#b6ff00', bg: 'rgba(182,255,0,0.08)',    border: 'rgba(182,255,0,0.25)' },
  INTERMEDIATE: { text: '#ffcc00', bg: 'rgba(255,204,0,0.08)',    border: 'rgba(255,204,0,0.25)' },
  ADVANCED:     { text: '#ff6b35', bg: 'rgba(255,107,53,0.08)',   border: 'rgba(255,107,53,0.25)' },
};

export default async function LearnPathPage({ params }: LearnPathPageProps) {
  const { path } = await params;
  const pathData = learnPaths[path as keyof typeof learnPaths];

  if (!pathData) {
    return <main style={{ padding: '3rem' }}>Path not found</main>;
  }

  const totalLessons = pathData.modules.reduce((sum, m) => sum + m.chapterCount, 0);
  const dc = DIFFICULTY_COLOR[pathData.difficulty] ?? DIFFICULTY_COLOR.BEGINNER;

  return (
    <div className={styles.page}>
      <div className={styles.glowLime} aria-hidden />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <Link href="/learn" className={styles.backLink}>
          <ArrowLeft strokeWidth={2.5} size={15} />
          Learning Hub
        </Link>

        {/* Hero */}
        <div className={styles.hero}>
          <span
            className={styles.diffBadge}
            style={{ color: dc.text, background: dc.bg, borderColor: dc.border }}
          >
            {DIFFICULTY_LABEL[pathData.difficulty]}
          </span>

          <h1 className={styles.heroTitle}>{pathData.title}</h1>
          <p className={styles.heroDesc}>{pathData.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaChip}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              {pathData.modules.length} modules
            </span>
            <span className={styles.metaChip}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {totalLessons} lessons
            </span>
            <span className={styles.metaChip}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
          <div className={styles.moduleSectionLabel}>Modules in this track</div>
          <ModulesAccordion modules={pathData.modules} pathKey={path} />
        </div>
      </div>
    </div>
  );
}
