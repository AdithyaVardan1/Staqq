'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import styles from './LessonSidebar.module.css';

interface Chapter {
  slug: string;
  title: string;
}

interface SidebarModule {
  slug: string;
  title: string;
  chapters: Chapter[];
}

interface LessonSidebarProps {
  pathKey: string;
  pathTitle: string;
  modules: SidebarModule[];
  currentModuleSlug: string;
  currentChapterSlug: string;
}

export function LessonSidebar({
  pathKey,
  pathTitle,
  modules,
  currentModuleSlug,
  currentChapterSlug,
}: LessonSidebarProps) {
  const { isLessonComplete, getCompletedCountForModule, isLoaded } = useProgress();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <Link href={`/learn/${pathKey}`} className={styles.pathLink}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {pathTitle}
        </Link>
      </div>

      {/* Module list */}
      <div className={styles.moduleList}>
        {modules.map((mod, modIndex) => {
          const isCurrentModule = mod.slug === currentModuleSlug;
          const completedInModule = isLoaded ? getCompletedCountForModule(pathKey, mod.slug) : 0;
          const allDone = completedInModule === mod.chapters.length && mod.chapters.length > 0;

          return (
            <div key={mod.slug} className={`${styles.moduleGroup} ${isCurrentModule ? styles.moduleGroupActive : ''}`}>
              {/* Module title row */}
              <div className={styles.moduleHeader}>
                <span className={styles.moduleNum}>{String(modIndex + 1).padStart(2, '0')}</span>
                <span className={styles.moduleTitle}>{mod.title}</span>
                {allDone && (
                  <span className={styles.moduleCheck} title="Module complete">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Chapter list - only show for current module */}
              {isCurrentModule && (
                <div className={styles.chapterList}>
                  {mod.chapters.map((ch, chIndex) => {
                    const isCurrent = ch.slug === currentChapterSlug;
                    const isDone = isLoaded && isLessonComplete(pathKey, mod.slug, ch.slug);

                    return (
                      <Link
                        key={ch.slug}
                        href={`/learn/${pathKey}/${mod.slug}/${ch.slug}`}
                        className={`${styles.chapterItem} ${isCurrent ? styles.chapterCurrent : ''} ${isDone ? styles.chapterDone : ''}`}
                        onClick={() => setOpen(false)}
                      >
                        {/* Status dot */}
                        <span className={styles.chapterDot}>
                          {isDone ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : isCurrent ? (
                            <span className={styles.dotActive} />
                          ) : (
                            <span className={styles.dotEmpty} />
                          )}
                        </span>
                        <span className={styles.chapterTitle}>{ch.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Collapsed indicator for other modules */}
              {!isCurrentModule && (
                <div className={styles.collapsedInfo}>
                  {completedInModule}/{mod.chapters.length} lessons
                  {completedInModule > 0 && !allDone && (
                    <span className={styles.inProgressDot} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>{sidebar}</div>

      {/* Mobile: floating toggle */}
      <button className={styles.mobileToggle} onClick={() => setOpen(true)} aria-label="Open course navigation">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Contents
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.mobileOverlay} onClick={() => setOpen(false)}>
          <div className={styles.mobileDrawer} onClick={e => e.stopPropagation()}>
            <button className={styles.drawerClose} onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
