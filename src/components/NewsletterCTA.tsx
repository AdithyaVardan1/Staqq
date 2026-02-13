'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import styles from './NewsletterCTA.module.css';

export function NewsletterCTA() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/newsletter/test-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to subscribe');

            setStatus('success');
            setMessage('You have successfully subscribed! The newsletter will arrive shortly.');
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <section className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.layout}>
                    {/* Left: Logo */}
                    <div className={styles.logoSection}>
                        <div className={styles.logoWrapper}>
                            <Image
                                src="/logo.jpeg"
                                alt="Staqq Logo"
                                width={220}
                                height={220}
                                className={styles.logo}
                            />
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className={styles.content}>
                        <h2 className={styles.title}>
                            Join <span className="text-brand">The Stack</span>
                        </h2>
                        <p className={styles.description}>
                            Get the weekly edge in Indian markets. No noise, just signal.
                            Sent every Wednesday.
                        </p>

                        {status !== 'success' && (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    disabled={status === 'loading'}
                                    suppressHydrationWarning
                                />
                                <Button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={styles.button}
                                >
                                    {status === 'loading' ? 'Joining...' : 'Subscribe'}
                                </Button>
                            </form>
                        )}

                        {message && status === 'success' && (
                            <div className={styles.successCard}>
                                <div className={styles.successIconWrapper}>
                                    <CheckCircle size={22} />
                                </div>
                                <div>
                                    <h3 className={styles.successHeading}>You&apos;re in! 🎉</h3>
                                    <p className={styles.successMessage}>{message}</p>
                                </div>
                            </div>
                        )}

                        {message && status === 'error' && (
                            <div className={`${styles.status} ${styles.error}`}>
                                <AlertCircle size={16} />
                                <span>{message}</span>
                            </div>
                        )}

                        <p className={styles.disclaimer}>
                            Grow your stack, we’ve got your back — unsubscribe anytime, no strings attached.
                        </p>
                    </div>
                </div>
            </Card>
        </section>
    );
}

