
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Signup Logic
        console.log('Signup attempt:', name, email, password);
        alert('This is a demo. Signup functionality coming soon!');
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Card className={styles.authCard}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Join Staqq and start your financial journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Adithya Vardan"
                                className={styles.input}
                                required
                            />
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
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>Already have an account? <Link href="/login" className={styles.link}>Log In</Link></p>
                    </div>
                </Card>
            </div>
        </main>
    );
}
