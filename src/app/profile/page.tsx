'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { User, Settings, LogOut, Loader2, Crown, CreditCard } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}

function ProfileContent() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const upgraded = searchParams.get('upgraded') === 'true';
    const { isPro, planId, periodEnd, cancelAtPeriodEnd, refresh: refreshSub } = useSubscription();

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (data) {
                    setProfile(data);
                } else {
                    setProfile({
                        username: user.email?.split('@')[0],
                        full_name: user.user_metadata?.full_name || 'Trader',
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [supabase, router]);

    const handleCancel = async () => {
        if (!confirm('Cancel your Pro subscription? You\'ll keep access until the end of your billing period.')) return;
        setCancelLoading(true);
        try {
            const res = await fetch('/api/billing/cancel', { method: 'POST' });
            if (res.ok) {
                await refreshSub();
            }
        } catch (err) {
            console.error('Cancel error:', err);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        <User size={48} className="text-brand" />
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>{profile?.full_name || 'Staqq Member'}</h1>
                        <p className={styles.userHandle}>@{profile?.username || 'member'}</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                    </div>
                </div>

                {upgraded && (
                    <div className={styles.upgradeBanner}>
                        <Crown size={18} />
                        <span>Welcome to Staqq Pro! Your subscription is now active.</span>
                    </div>
                )}

                <div className={styles.grid}>
                    {/* Stats */}
                    <Card className={styles.statsCard}>
                        <h3>Your Stats</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>12</span>
                                <span className={styles.statLabel}>Watchlist</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>0</span>
                                <span className={styles.statLabel}>Alerts</span>
                            </div>
                        </div>
                    </Card>

                    {/* Subscription & Billing */}
                    <Card className={styles.subscriptionCard}>
                        <div className={styles.subscriptionHeader}>
                            <div className={styles.subscriptionTitle}>
                                <CreditCard size={20} className="text-brand" />
                                <h3>Subscription</h3>
                            </div>
                            {isPro && <PremiumBadge size="sm" />}
                        </div>

                        {isPro ? (
                            <div className={styles.subscriptionBody}>
                                <div className={styles.planRow}>
                                    <span className={styles.planLabel}>Plan</span>
                                    <span className={styles.planValue}>
                                        {planId?.includes('yearly') ? 'Pro Yearly' : 'Pro Monthly'}
                                    </span>
                                </div>
                                {periodEnd && (
                                    <div className={styles.planRow}>
                                        <span className={styles.planLabel}>
                                            {cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
                                        </span>
                                        <span className={styles.planValue}>
                                            {new Date(periodEnd).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                                {cancelAtPeriodEnd ? (
                                    <p className={styles.cancelNote}>
                                        Your subscription will not renew.
                                    </p>
                                ) : (
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={handleCancel}
                                        disabled={cancelLoading}
                                    >
                                        {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={styles.subscriptionBody}>
                                <p className={styles.freePlanText}>
                                    You&apos;re on the <strong>Free</strong> plan.
                                </p>
                                <Link href="/pricing" className={styles.upgradeBtn}>
                                    <Crown size={16} />
                                    Upgrade to Pro
                                </Link>
                            </div>
                        )}
                    </Card>

                    {/* Settings Menu */}
                    <div className={styles.settingsMenu}>
                        <button className={styles.menuItem}>
                            <Settings size={20} />
                            <span>Account Settings</span>
                        </button>
                        <button
                            className={`${styles.menuItem} ${styles.danger}`}
                            onClick={handleLogout}
                        >
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
