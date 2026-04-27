'use client';

import Link from 'next/link';
import styles from './ModulesAccordion.module.css';

interface Module {
  slug: string;
  title: string;
  description?: string;
  chapterCount?: number;
}

interface ModulesAccordionProps {
  modules: Module[];
  pathKey: string;
}

export default function ModulesAccordion({ modules, pathKey }: ModulesAccordionProps) {
  return (
    <div className={styles.list}>
      {modules.map((module, index) => (
        <Link
          key={module.slug}
          href={`/learn/${pathKey}/${module.slug}`}
          className={styles.card}
        >
          <div className={styles.indexBadge}>{String(index + 1).padStart(2, '0')}</div>

          <div className={styles.body}>
            <h2 className={styles.title}>{module.title}</h2>
            {module.description && (
              <p className={styles.description}>{module.description}</p>
            )}
          </div>

          <div className={styles.right}>
            {module.chapterCount != null && (
              <span className={styles.chapterCount}>{module.chapterCount} lessons</span>
            )}
            <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
