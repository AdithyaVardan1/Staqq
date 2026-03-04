'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Users, UserCheck, UserMinus, TrendingUp,
    Send, FlaskConical, Trash2, Search,
    RefreshCw, CheckCircle2, XCircle, Loader2,
    Mail, Shield
} from 'lucide-react';
import styles from './page.module.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Stats {
    total: number;
    active: number;
    unsubscribed: number;
    newThisWeek: number;
}

interface Subscriber {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
}

type SendLog = { time: string; mode: string; result: string; success: boolean };
type Filter = 'all' | 'active' | 'inactive';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CRON_SECRET = process.env.NEXT_PUBLIC_CRON_SECRET ?? '';

function adminHeaders() {
    return { 'Content-Type': 'application/json', 'x-cron-secret': CRON_SECRET };
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsletterAdminPage() {
    const [cronSecret, setCronSecret] = useState('');
    const [authed, setAuthed] = useState(false);
    const [authError, setAuthError] = useState('');

    const [stats, setStats] = useState<Stats | null>(null);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [loading, setLoading] = useState(false);

    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState<'test' | 'production' | null>(null);
    const [sendLogs, setSendLogs] = useState<SendLog[]>([]);

    // ── Fetch data ──────────────────────────────────────────────────────────

    const fetchAll = useCallback(async (secret: string, q = '', f: Filter = 'all') => {
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json', 'x-cron-secret': secret };

            const [statsRes, subsRes] = await Promise.all([
                fetch('/api/admin/newsletter/stats', { headers }),
                fetch(`/api/admin/newsletter/subscribers?search=${encodeURIComponent(q)}&filter=${f}`, { headers }),
            ]);

            if (statsRes.status === 401 || subsRes.status === 401) {
                setAuthError('Invalid CRON_SECRET. Please try again.');
                setAuthed(false);
                return;
            }

            const statsData = await statsRes.json();
            const subsData = await subsRes.json();
            setStats(statsData);
            setSubscribers(subsData.subscribers ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAuth = async () => {
        setAuthError('');
        await fetchAll(cronSecret);
        setAuthed(true);
    };

    useEffect(() => {
        if (!authed) return;
        fetchAll(cronSecret, search, filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, filter]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Remove ${email} from subscribers?`)) return;
        await fetch('/api/admin/newsletter/subscribers', {
            method: 'DELETE',
            headers: adminHeaders(),
            body: JSON.stringify({ id }),
        });
        setSubscribers(prev => prev.filter(s => s.id !== id));
        if (stats) setStats({ ...stats, total: stats.total - 1, active: stats.active - 1 });
    };

    const triggerSend = async (mode: 'test' | 'production') => {
        if (mode === 'production' && !confirm(
            '⚠️ This will send the newsletter to ALL active subscribers RIGHT NOW. Proceed?'
        )) return;

        setSending(mode);
        const time = new Date().toLocaleTimeString('en-IN');

        try {
            const res = await fetch('/api/admin/newsletter/trigger-send', {
                method: 'POST',
                headers: adminHeaders(),
                body: JSON.stringify({ mode, testEmail: mode === 'test' ? testEmail : undefined }),
            });
            const data = await res.json();
            const success = res.ok && !data.error;
            const result = success
                ? mode === 'test' ? `Test sent to ${testEmail}` : `Sent to ${data.sent ?? '?'} subscribers`
                : data.error ?? 'Unknown error';
            setSendLogs(prev => [{ time, mode, result, success }, ...prev].slice(0, 20));
        } catch (e: any) {
            setSendLogs(prev => [{ time, mode, result: e.message, success: false }, ...prev].slice(0, 20));
        } finally {
            setSending(null);
            fetchAll(cronSecret, search, filter);
        }
    };

    // ── Auth Gate ────────────────────────────────────────────────────────────

    if (!authed) {
        return (
            <main className={styles.main}>
                <div className={styles.authGate}>
                    <div className={styles.authCard}>
                        <Shield size={40} className={styles.authIcon} />
                        <h1 className={styles.authTitle}>Newsletter Admin</h1>
                        <p className={styles.authSub}>Enter your CRON_SECRET to continue</p>
                        <input
                            type="password"
                            className={styles.authInput}
                            placeholder="CRON_SECRET"
                            value={cronSecret}
                            onChange={e => setCronSecret(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAuth()}
                        />
                        {authError && <p className={styles.authError}>{authError}</p>}
                        <button className={styles.authBtn} onClick={handleAuth}>
                            Enter Dashboard
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // ── Dashboard ────────────────────────────────────────────────────────────

    return (
        <main className={styles.main}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>
                            <Mail size={28} className={styles.titleIcon} />
                            Newsletter Admin
                        </h1>
                        <p className={styles.subtitle}>Manage subscribers, send previews, and monitor delivery</p>
                    </div>
                    <button className={styles.refreshBtn} onClick={() => fetchAll(cronSecret, search, filter)} disabled={loading}>
                        <RefreshCw size={16} className={loading ? styles.spin : ''} />
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <StatCard icon={<Users size={22} />} label="Total Subscribers" value={stats?.total ?? '—'} color="brand" />
                    <StatCard icon={<UserCheck size={22} />} label="Active" value={stats?.active ?? '—'} color="green" />
                    <StatCard icon={<UserMinus size={22} />} label="Unsubscribed" value={stats?.unsubscribed ?? '—'} color="red" />
                    <StatCard icon={<TrendingUp size={22} />} label="New This Week" value={stats?.newThisWeek ?? '—'} color="brand" />
                </div>

                <div className={styles.grid}>

                    {/* ── Left: Subscribers Table ── */}
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>Subscribers</h2>
                            <span className={styles.badge}>{subscribers.length}</span>
                        </div>

                        {/* Search + Filter */}
                        <div className={styles.tableControls}>
                            <div className={styles.searchWrap}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    className={styles.searchInput}
                                    placeholder="Search email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className={styles.filters}>
                                {(['all', 'active', 'inactive'] as Filter[]).map(f => (
                                    <button
                                        key={f}
                                        className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Subscribed</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.length === 0 && (
                                        <tr><td colSpan={4} className={styles.empty}>No subscribers found</td></tr>
                                    )}
                                    {subscribers.map(s => (
                                        <tr key={s.id} className={styles.row}>
                                            <td className={styles.emailCell}>{s.email}</td>
                                            <td className={styles.dateCell}>{fmtDate(s.subscribed_at)}</td>
                                            <td>
                                                <span className={`${styles.statusPill} ${s.is_active ? styles.active : styles.inactive}`}>
                                                    {s.is_active ? 'Active' : 'Unsubscribed'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(s.id, s.email)}
                                                    title="Remove subscriber"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Right: Send Controls + Logs ── */}
                    <div className={styles.rightCol}>

                        {/* Send Controls */}
                        <section className={styles.panel}>
                            <h2 className={styles.panelTitle}>Send Newsletter</h2>

                            {/* Test Send */}
                            <div className={styles.sendBlock}>
                                <p className={styles.sendLabel}>
                                    <FlaskConical size={16} />
                                    Test Send (single email)
                                </p>
                                <div className={styles.sendRow}>
                                    <input
                                        className={styles.emailInput}
                                        placeholder="you@gmail.com"
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                    />
                                    <button
                                        className={styles.sendBtnTest}
                                        onClick={() => triggerSend('test')}
                                        disabled={!!sending || !testEmail}
                                    >
                                        {sending === 'test' ? <Loader2 size={14} className={styles.spin} /> : <Send size={14} />}
                                        {sending === 'test' ? 'Sending…' : 'Send Test'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            {/* Production Send */}
                            <div className={styles.sendBlock}>
                                <p className={styles.sendLabel}>
                                    <Send size={16} />
                                    Production Send (all {stats?.active ?? 0} subscribers)
                                </p>
                                <p className={styles.sendWarning}>
                                    ⚠️ This sends the full newsletter to everyone right now. Use the Wednesday cron for scheduled delivery.
                                </p>
                                <button
                                    className={styles.sendBtnProd}
                                    onClick={() => triggerSend('production')}
                                    disabled={!!sending}
                                >
                                    {sending === 'production' ? <Loader2 size={14} className={styles.spin} /> : <Send size={14} />}
                                    {sending === 'production' ? 'Sending…' : 'Send to All Subscribers'}
                                </button>
                            </div>
                        </section>

                        {/* Send Logs */}
                        {sendLogs.length > 0 && (
                            <section className={styles.panel}>
                                <h2 className={styles.panelTitle}>Send History</h2>
                                <div className={styles.logList}>
                                    {sendLogs.map((log, i) => (
                                        <div key={i} className={styles.logItem}>
                                            <div className={styles.logStatus}>
                                                {log.success
                                                    ? <CheckCircle2 size={14} className={styles.logSuccess} />
                                                    : <XCircle size={14} className={styles.logFail} />}
                                            </div>
                                            <div className={styles.logContent}>
                                                <span className={styles.logMode}>{log.mode === 'test' ? 'Test' : 'Production'}</span>
                                                <span className={styles.logResult}>{log.result}</span>
                                            </div>
                                            <span className={styles.logTime}>{log.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: 'brand' | 'green' | 'red';
}) {
    return (
        <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
            <div className={styles.statIcon}>{icon}</div>
            <div>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statLabel}>{label}</div>
            </div>
        </div>
    );
}
