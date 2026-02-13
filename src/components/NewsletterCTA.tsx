'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
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
                <div className={styles.content}>
                    <div className={styles.iconWrapper}>
                        <Zap size={32} className="text-brand" />
                    </div>
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
                                {status === 'loading' ? 'Joining...' : 'Subscribe Free'}
                            </Button>
                        </form>
                    )}

                    {message && (
                        <div className={`${styles.status} ${status === 'success' ? styles.success : styles.error}`}>
                            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>{message}</span>
                        </div>
                    )}

                    <p className={styles.disclaimer}>
                        Join 10,000+ investors. Unsubscribe anytime.
                    </p>
                </div>
            </Card>
        </section>
    );
}
