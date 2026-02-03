
import React from 'react';
import { Button } from '@/components/ui/Button';
import { IPOCard } from '@/components/ipo/IPOCard';
import styles from './page.module.css';

// Mock Data
const LIVE_IPOS = [
  { slug: 'zomato-limited', name: 'Zomato Ltd', priceBand: '₹72 - ₹76', openDate: 'Jul 14', closeDate: 'Jul 16', gmp: '+₹15', gmpPercent: 20, subscription: 4.5, status: 'Live' as const },
  { slug: 'paytm', name: 'Paytm', priceBand: '₹2080 - ₹2150', openDate: 'Nov 08', closeDate: 'Nov 10', gmp: '-₹50', gmpPercent: -2, subscription: 0.8, status: 'Live' as const },
];

const UPCOMING_IPOS = [
  { slug: 'ola-electric', name: 'Ola Electric', priceBand: '₹100 - ₹120', openDate: 'Coming Soon', closeDate: '', status: 'Upcoming' as const },
];

export default function IPODashboard() {
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
              Track live GMP, check subscription status, and analyze IPOs like a pro.
            </p>
          </div>

          <div className={styles.sectionHeader}>
            <h2>Current IPOs</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>

          <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {LIVE_IPOS.map((ipo) => (
              <IPOCard key={ipo.slug} {...ipo} />
            ))}
            {/* Adding more mock/placeholder to fill grid */}
            <IPOCard slug="swiggy" name="Swiggy" priceBand="₹300 - ₹350" openDate="Aug 01" closeDate="Aug 03" gmp="+₹30" gmpPercent={10} subscription={1.2} status="Live" />
          </div>
        </div>
      </section>

      {/* Upcoming Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Upcoming Opportunities</h2>
            <Button variant="ghost" size="sm">View Calendar</Button>
          </div>
          <div className="grid-cols-1 md:grid-cols-3" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {UPCOMING_IPOS.map((ipo) => (
              <IPOCard key={ipo.slug} {...ipo} />
            ))}
            <IPOCard slug="ixigo" name="Ixigo" priceBand="₹80 - ₹90" openDate="Sep 10" closeDate="Sep 12" status="Upcoming" />
          </div>
        </div>
      </section>
    </main>
  );
}
