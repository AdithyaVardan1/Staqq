
import React from 'react';
import styles from './page.module.css';

export default function PrivacyPage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <article className={styles.content}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last updated: October 2023</p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
                        <p className={styles.text}>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
                        <p className={styles.text}>We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you technical notices, and respond to your comments.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Data Security</h2>
                        <p className={styles.text}>We implement reasonable security measures to protect your personal information. However, no security system is impenetrable.</p>
                    </section>
                </article>
            </div>
        </main>
    );
}
