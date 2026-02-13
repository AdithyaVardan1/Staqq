'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Award, Settings, LogOut, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

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
                    // Fallback if trigger didn't fire or legacy user
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
                        <p className={styles.userHandle}>@{profile?.username || 'member'} • Pro Member</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                    </div>
                </div>

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
                                <span className={styles.statValue}>5</span>
                                <span className={styles.statLabel}>Modules</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>850</span>
                                <span className={styles.statLabel}>XP</span>
                            </div>
                        </div>
                    </Card>

                    {/* Badges/Achievements */}
                    <Card className={styles.achievementsCard}>
                        <div className={styles.cardHeader}>
                            <h3>Achievements</h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className={styles.badgesList}>
                            <div className={styles.badge}>
                                <Award size={24} className="text-yellow-400" />
                                <span>Fast Learner</span>
                            </div>
                            <div className={styles.badge}>
                                <Award size={24} className="text-blue-400" />
                                <span>IPO Guru</span>
                            </div>
                            <div className={styles.badge}>
                                <Award size={24} className="text-purple-400" />
                                <span>Early Bird</span>
                            </div>
                        </div>
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
