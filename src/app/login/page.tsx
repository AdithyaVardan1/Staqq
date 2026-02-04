
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Login Logic
        console.log('Login attempt:', email, password);
        alert('This is a demo. Login functionality coming soon!');
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

                        <Button variant="primary" fullWidth size="lg">Log In</Button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don't have an account? <Link href="/signup" className={styles.link}>Sign Up</Link></p>
                    </div>
                </Card>
            </div>
        </main>
    );
}
