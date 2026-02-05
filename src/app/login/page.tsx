
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './page.module.css';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            router.push('/profile');
            router.refresh();
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Card className={styles.authCard}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Log in to track your IPOs and builds.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Google Login */}
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={handleGoogleLogin}
                            className="mb-4"
                        >
                            Continue with Google
                        </Button>

                        <div className="flex items-center gap-4 my-2">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={styles.input}
                                required
                            />
                        </div>

                        <Button variant="primary" fullWidth size="lg" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don't have an account? <Link href="/signup" className={styles.link}>Sign Up</Link></p>
                    </div>
                </Card>
            </div>
        </main>
    );
}
