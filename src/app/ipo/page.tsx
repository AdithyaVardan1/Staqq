import React from 'react';
import { getAllIPOs } from '@/lib/ipo';
import type { IPOData } from '@/lib/ipo';
import { IPOCard } from '@/components/ipo/IPOCard';
import styles from './page.module.css';

export const revalidate = 300; // Auto-refresh every 5 minutes

export default async function IPODashboard() {
  const allIPOs = await getAllIPOs();

  const liveIPOs = allIPOs.filter(i => i.status === 'Live');
  const upcomingIPOs = allIPOs.filter(i => i.status === 'Upcoming');
  const listedIPOs = allIPOs.filter(i => i.status === 'Listed' || i.status === 'Closed');

  // Separate mainboard vs SME
  const mainboardIPOs = allIPOs.filter(i => i.category === 'IPO');
  const smeIPOs = allIPOs.filter(i => i.category === 'SME');

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroHeader}>
            <h1 className={styles.title}>
              IPO <span className="text-brand">Hub</span>
            </h1>
            <p className={styles.subtitle}>
              Live GMP, subscription status & analysis — updated every 5 minutes.
            </p>
            <div className={styles.stats}>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{liveIPOs.length}</span>
                <span className={styles.statLabel}>Live</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{upcomingIPOs.length}</span>
                <span className={styles.statLabel}>Upcoming</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{listedIPOs.length}</span>
                <span className={styles.statLabel}>Listed</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{mainboardIPOs.length}</span>
                <span className={styles.statLabel}>Mainboard</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{smeIPOs.length}</span>
                <span className={styles.statLabel}>SME</span>
              </div>
            </div>
          </div>

          {/* Live IPOs */}
          {liveIPOs.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h2>🔴 Live IPOs</h2>
                <span className={styles.count}>{liveIPOs.length} active</span>
              </div>
              <div className={styles.grid}>
                {liveIPOs.map((ipo) => (
                  <IPOCard key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </>
          )}

          {/* Upcoming IPOs */}
          {upcomingIPOs.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h2>📅 Upcoming IPOs</h2>
                <span className={styles.count}>{upcomingIPOs.length} scheduled</span>
              </div>
              <div className={styles.grid}>
                {upcomingIPOs.map((ipo) => (
                  <IPOCard key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </>
          )}

          {/* Listed IPOs */}
          {listedIPOs.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h2>✅ Recently Listed</h2>
                <span className={styles.count}>{listedIPOs.length} completed</span>
              </div>
              <div className={styles.grid}>
                {listedIPOs.map((ipo) => (
                  <IPOCard key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
