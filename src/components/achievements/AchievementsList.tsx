"use client";

import { useAchievementsStore } from '@/store/useAchievementsStore';
import AchievementCard from './AchievementCard';
import { useState, useMemo } from 'react';
import { AchievementCategory } from '@/lib/achievements';
import { motion } from 'framer-motion';

const CATEGORIES: AchievementCategory[] = ['Learning', 'IPO', 'Stocks', 'Streak', 'Rare'];

export default function AchievementsList() {
    const { achievements, unlockedIds, loading } = useAchievementsStore();
    const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'All'>('All');

    const filteredAchievements = useMemo(() => {
        if (activeCategory === 'All') return achievements;
        return achievements.filter(a => a.category === activeCategory);
    }, [achievements, activeCategory]);

    const progress = useMemo(() => {
        if (achievements.length === 0) return 0;
        return Math.round((unlockedIds.size / achievements.length) * 100);
    }, [achievements, unlockedIds]);

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading achievements...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Your Trophy Case</h2>
                    <p className="text-sm text-gray-400">
                        {unlockedIds.size} / {achievements.length} Unlocked
                    </p>
                </div>
                <div className="w-32 bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setActiveCategory('All')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 'All'
                            ? 'bg-brand text-black'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-brand text-black'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAchievements.map(achievement => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={unlockedIds.has(achievement.id)}
                    // unlockedAt would need to be stored in map in store, for now omit or use mock
                    />
                ))}
            </div>

            {filteredAchievements.length === 0 && (
                <div className="text-center py-12 text-gray-500 italic">
                    No achievements in this category yet.
                </div>
            )}
        </div>
    );
}
