
import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brandCol}>
                        <Link href="/" className={styles.logo}>STAQQ</Link>
                        <p className={styles.tagline}>
                            The financial stack for Gen Z. Simplify your investment journey today.
                        </p>
                    </div>

                    {/* Links */}
                    <div className={styles.linksCol}>
                        <h4>Platform</h4>
                        <Link href="/ipo">IPO Hub</Link>
                        <Link href="/stocks/screener">Stocks</Link>
                        <Link href="/learn">Learn</Link>
                        <Link href="/tools">Tools</Link>
                    </div>

                    <div className={styles.linksCol}>
                        <h4>Legal</h4>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/disclaimer">Disclaimer</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>

                    {/* Socials */}
                    <div className={styles.socialCol}>
                        <h4>Connect</h4>
                        <div className={styles.socialIcons}>
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Staqq Finance. All rights reserved.</p>
                    <p className={styles.disclaimerText}>
                        Investments in securities market are subject to market risks, read all the related documents carefully before investing.
                    </p>
                </div>
            </div>
        </footer>
    );
};
