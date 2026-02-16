
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
                            <a href="https://x.com/staqqfinance" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/staqq.in/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="https://www.linkedin.com/company/staqq-finance" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
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
