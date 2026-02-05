
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Award, Settings, LogOut } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        <User size={48} className="text-brand" />
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>Adithya Vardan</h1>
                        <p className={styles.userHandle}>@adithyav • Pro Member</p>
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
                        <button className={`${styles.menuItem} ${styles.danger}`}>
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
