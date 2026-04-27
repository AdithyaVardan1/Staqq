'use client';

import { motion } from 'framer-motion';
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
  accentColor?: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: any = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function ModulesAccordion({ modules, pathKey, accentColor }: ModulesAccordionProps) {
  return (
    <motion.div
      className={styles.list}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {modules.map((module, index) => (
        <motion.div key={module.slug} variants={item}>
          <Link
            href={`/learn/${pathKey}/${module.slug}`}
            className={styles.card}
            style={accentColor ? { '--accent': accentColor } as React.CSSProperties : undefined}
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
              <svg className={styles.arrow} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
