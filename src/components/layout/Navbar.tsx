
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { SearchModal } from './SearchModal';
import { useComparisonStore } from '@/store/useComparisonStore';
import styles from './Navbar.module.css';

const navLinks = [
    { name: 'IPO Hub', href: '/ipo' },
    { name: 'Stocks', href: '/stocks/screener' },
    { name: 'Learn', href: '/learn' },
    { name: 'Tools', href: '/tools' },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const { triggerSearch, setTriggerSearch } = useComparisonStore();

    useEffect(() => {
        if (triggerSearch) {
            setIsSearchOpen(true);
            setTriggerSearch(false);
        }
    }, [triggerSearch, setTriggerSearch]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === '/') {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsSearchOpen(true);
                }
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // creating a reload to force state update or redirect could be done here
        window.location.href = '/';
    };

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
                            <div className={styles.logoImageWrapper}>
                                <Image
                                    src="/staqq.png"
                                    alt="STAQQ"
                                    width={100}
                                    height={32}
                                    className={styles.logoImage}
                                    priority
                                />
                            </div>
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
                            <button
                                className={styles.iconBtn}
                                aria-label="Search"
                                onClick={() => setIsSearchOpen(true)}
                                suppressHydrationWarning
                            >
                                <Search size={20} />
                            </button>

                            <Link href="/watchlist" className={styles.watchlistLink}>
                                <Button variant="ghost" size="sm" className="hidden md:flex">Watchlist</Button>
                            </Link>

                            <div className={styles.desktopAuth}>
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <Link href="/profile" aria-label="Profile">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10">
                                                <User size={16} className="text-white" />
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login">
                                            <Button variant="ghost" size="sm">Log In</Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button variant="primary" size="sm">Get Started</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <button
                                className={styles.mobileToggle}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle Menu"
                                suppressHydrationWarning
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
                        <Link href="/watchlist" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" fullWidth>Watchlist</Button>
                        </Link>
                        {user ? (
                            <>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="primary" fullWidth>My Profile</Button>
                                </Link>
                                <Button variant="ghost" fullWidth onClick={handleLogout}>Log Out</Button>
                            </>
                        ) : (
                            <>
                                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="primary" fullWidth>Get Started</Button>
                                </Link>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" fullWidth>Log In</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
};
