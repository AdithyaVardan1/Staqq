'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import styles from './EmailCapture.module.css';

export function EmailCapture() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus('done');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    if (status === 'done') {
        return (
            <div className={styles.wrapper}>
                <div className={styles.success}>
                    <CheckCircle size={20} />
                    <span>You are in. We will send you IPO alerts and market updates.</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <Mail size={16} />
                <span>Get IPO alerts and market signals in your inbox</span>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                    className={styles.input}
                    required
                />
                <button type="submit" disabled={status === 'loading'} className={styles.button}>
                    {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}
                </button>
            </form>
            {status === 'error' && (
                <p className={styles.errorText}>Something went wrong. Try again.</p>
            )}
            <p className={styles.note}>Free. No spam. Unsubscribe anytime.</p>
        </div>
    );
}
