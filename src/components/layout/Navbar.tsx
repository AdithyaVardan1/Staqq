
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './Navbar.module.css';

const navLinks = [
    { name: 'IPO Hub', href: '/' },
    { name: 'Stocks', href: '/stocks/screener' },
    { name: 'Learn', href: '/learn' },
    { name: 'Tools', href: '/tools' },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={clsx(styles.navbar, {
                    [styles.scrolled]: isScrolled,
                })}
            >
                <div className="container">
                    <div className={styles.inner}>
                        {/* Logo */}
                        <Link href="/" className={styles.logo}>
                            STAQQ
                        </Link>

                        {/* Desktop Nav */}
                        <nav className={styles.desktopNav}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={clsx(styles.navLink, {
                                        [styles.active]: pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)),
                                    })}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button className={styles.iconBtn} aria-label="Search">
                                <Search size={20} />
                            </button>
                            <div className={styles.desktopAuth}>
                                <Button variant="primary" size="sm">Get Started</Button>
                            </div>
                            <button
                                className={styles.mobileToggle}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={clsx(styles.mobileMenu, { [styles.open]: isMobileMenuOpen })}>
                <div className={styles.mobileMenuInner}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(styles.mobileNavLink, {
                                [styles.active]: pathname === link.href,
                            })}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className={styles.mobileAuth}>
                        <Button variant="primary" fullWidth>Get Started</Button>
                        <Button variant="ghost" fullWidth>Log In</Button>
                    </div>
                </div>
            </div>
        </>
    );
};
