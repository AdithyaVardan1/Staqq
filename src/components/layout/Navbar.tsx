'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/utils/supabase/client';
import styles from './Navbar.module.css';

const navLinks = [
    { name: 'IPO Hub', href: '/ipo' },
    { name: 'Stocks', href: '/stocks/screener' },
    { name: 'Pulse', href: '/alerts' },
    { name: 'Learn', href: '/learn' },
    { name: 'Tools', href: '/tools' },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

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
            if (_event === 'SIGNED_OUT') {
                router.refresh();
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
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
                                <Logo
                                    width={120}
                                    height={120}
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
                            <button className={styles.iconBtn} aria-label="Search" suppressHydrationWarning>
                                <Search size={20} />
                            </button>

                            <div className={styles.desktopAuth}>
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <Link href="/watchlist">
                                            <Button variant="ghost" size="sm">Watchlist</Button>
                                        </Link>
                                        <Link href="/profile" aria-label="Profile">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10 hover:border-brand/50 transition-colors">
                                                <User size={16} className="text-white" />
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login">
                                            <Button variant="ghost" size="sm">Log In</Button>
                                        </Link>
                                        <Link href="/login">
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
                        {user ? (
                            <>
                                <Link href="/watchlist" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" fullWidth>Watchlist</Button>
                                </Link>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="primary" fullWidth>My Profile</Button>
                                </Link>
                                <Button variant="ghost" fullWidth onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                                    <LogOut size={18} className="mr-2" />
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
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
        </>
    );
};
