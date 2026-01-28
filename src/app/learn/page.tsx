// import styles from './page.module.css';
// import LearningPathCard from '@/components/LearnPathCard/LearnPathCard';

// export default function LearnPage() {
//   return (
//     <main className={styles.container}>
//       <h1 className={styles.title}>Investment Learning Hub</h1>
//       <p className={styles.subtitle}>
//         Master the stock market, step by step.
//       </p>

//       <section className={styles.grid}>
//         <LearningPathCard
//           title="Absolute Beginner"
//           description="Start from zero. Learn what stocks are and how to invest safely."
//           modules={8}
//           progress={0}
//           slug='beginner'
//         />

//         <LearningPathCard
//           title="Understanding Financials"
//           description="Read balance sheets, P&L statements, and key ratios."
//           modules={6}
//           progress={20}
//           slug='financials'
//         />

//         <LearningPathCard
//           title="Technical Analysis"
//           description="Charts, patterns, indicators, and price action."
//           modules={7}
//           progress={0}
//           slug='technical'
//         />

//         <LearningPathCard
//           title="IPO Investing"
//           description="From RHP to listing day and long-term evaluation."
//           modules={4}
//           progress={0}
//           slug='ipo'
//         />

//         <LearningPathCard
//           title="Fundamental Analysis"
//           description="Deep-dive path for serious long-term investors."
//           modules={6}
//           progress={0}
//           slug='fundamentals'
//         />
//       </section>
//     </main>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import LearningPathCard from '@/components/LearnPathCard/LearnPathCard';
import { getPathSummary } from '@/utils/getPathSummary';
import { learnPaths } from '@/data/learnPaths';

export default function LearnPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const newProgress: Record<string, number> = {};

    Object.entries(learnPaths).forEach(([key, path]) => {
      const totalLessons = path.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );

      newProgress[key] = getPathSummary(key, totalLessons);
    });

    setProgress(newProgress);
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Investment Learning Hub</h1>
      <p className={styles.subtitle}>
        Master the stock market, step by step.
      </p>

      <section className={styles.grid}>
        <LearningPathCard
          title="Absolute Beginner"
          description="Start from zero. Learn what stocks are and how to invest safely."
          modules={8}
          progress={progress['beginner'] ?? 0}
          slug="beginner"
        />

        <LearningPathCard
          title="Understanding Financials"
          description="Read balance sheets, P&L statements, and key ratios."
          modules={6}
          progress={progress['financials'] ?? 0}
          slug="financials"
        />

        <LearningPathCard
          title="Technical Analysis"
          description="Charts, patterns, indicators, and price action."
          modules={7}
          progress={progress['technical'] ?? 0}
          slug="technical"
        />

        <LearningPathCard
          title="IPO Investing"
          description="From RHP to listing day and long-term evaluation."
          modules={4}
          progress={progress['ipo'] ?? 0}
          slug="ipo"
        />

        <LearningPathCard
          title="Fundamental Analysis"
          description="Deep-dive path for serious long-term investors."
          modules={6}
          progress={progress['fundamentals'] ?? 0}
          slug="fundamentals"
        />
      </section>
    </main>
  );
}
