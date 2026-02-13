'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrendingUp, BookOpen, Layers, Activity } from 'lucide-react'; // Example icons
import styles from './page.module.css';

const TrendingSection = () => {
  const [trending, setTrending] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/stocks/trending')
      .then(res => res.json())
      .then(data => {
        if (data.tickers) {
          // Deduplicate tickers
          const uniqueTickers = Array.from(new Set(data.tickers as string[]));
          setTrending(uniqueTickers);
        }
      })
      .catch(e => console.error('Failed to fetch trending:', e));
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className={styles.trendingContainer}>
      <span className={styles.trendingLabel}>
        <Activity size={14} className="text-brand" /> Trending:
      </span>
      <div className={styles.trendingList}>
        {trending.map(ticker => (
          <Link key={ticker} href={`/stocks/${ticker}`} className={styles.trendingItem}>
            {ticker}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              The Financial Stack for <span className="text-brand">Gen Z</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Uncomplicate your journey. Master IPOs, analyze Stocks, and Learn finance—all in one place.
            </p>
            <div className={styles.heroActions}>
              <Link href="/ipo">
                <Button size="lg">Explore IPOs</Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" size="lg">Start Learning</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.grid}>

            {/* IPO Hub Card */}
            <Link href="/ipo" className={styles.cardLink}>
              <Card className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <Layers size={40} className="text-brand" />
                </div>
                <h3>IPO Hub</h3>
                <p>Real-time GMP, subscription status, and deep analysis for every listing.</p>
              </Card>
            </Link>

            {/* Stocks Card */}
            <Link href="/stocks/screener" className={styles.cardLink}>
              <Card className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <TrendingUp size={40} className="text-brand" />
                </div>
                <h3>Stocks Section</h3>
                <p>Powerful screener and simplified technicals to find your next winner.</p>
              </Card>
            </Link>

            {/* Learn Card */}
            <Link href="/learn" className={styles.cardLink}>
              <Card className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <BookOpen size={40} className="text-brand" />
                </div>
                <h3>Learn Hub</h3>
                <p>Gamified lessons. No jargon. Master the market in 5 minutes a day.</p>
              </Card>
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}
