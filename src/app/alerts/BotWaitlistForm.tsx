'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import styles from './BotWaitlistForm.module.css';

export function BotWaitlistForm() {
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
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    if (status === 'done') {
        return (
            <div className={styles.success}>
                <div className={styles.successTop}>
                    <CheckCircle size={22} className={styles.successIcon} />
                    <div>
                        <div className={styles.successTitle}>You are on the list.</div>
                        <div className={styles.successSub}>Now open the bot on Telegram to get your welcome message the moment we launch.</div>
                    </div>
                </div>
                <a
                    href="https://t.me/StaqqBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tgBtn}
                >
                    <Send size={15} />
                    Open @StaqqBot on Telegram
                </a>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <p className={styles.label}>Drop your email and we will ping you at launch. Then open the bot to get your welcome message.</p>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                    className={styles.input}
                    required
                    autoComplete="email"
                />
                <button type="submit" disabled={status === 'loading'} className={styles.submitBtn}>
                    {status === 'loading'
                        ? <Loader2 size={15} className={styles.spinner} />
                        : 'Notify me'}
                </button>
            </form>
            {status === 'error' && (
                <p className={styles.errorText}>Something went wrong. Try again.</p>
            )}
            <p className={styles.note}>No spam. Unsubscribe anytime.</p>
        </div>
    );
}
