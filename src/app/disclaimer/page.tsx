
import React from 'react';
import styles from '../privacy/page.module.css'; // Reusing styles

export default function DisclaimerPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <article className={styles.content}>
                    <h1 className={styles.title}>Disclaimer</h1>
                    <p className={styles.lastUpdated}>Important Legal Information</p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Not Investment Advice</h2>
                        <p className={styles.text}>The content provided on Staqq is for educational and informational purposes only. It does not constitute professional financial advice, guidance, or recommendations.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>No Registration</h2>
                        <p className={styles.text}>Staqq is not a SEBI registered investment advisor or broker. Any financial decisions you make are solely your responsibility.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Market Risks</h2>
                        <p className={styles.text}>Investments in the securities market are subject to market risks. Read all specific related documents carefully before investing. Past performance is not indicative of future results.</p>
                    </section>
                </article>
            </div>
        </main>
    );
}
