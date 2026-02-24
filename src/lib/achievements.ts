import { createClient } from '@/utils/supabase/client';

export type AchievementCategory = 'Learning' | 'IPO' | 'Stocks' | 'Streak' | 'Rare';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    icon: string;
    points: number;
}

export interface UserAchievement {
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
}

export const ACHIEVEMENT_IDS = {
    // Learning
    FIRST_STACK: 'first_stack',
    MARKET_SCHOLAR: 'market_scholar',
    IPO_NERD: 'ipo_nerd',
    CHART_READER: 'chart_reader',
    BALANCE_SHEET_BEAST: 'balance_sheet_beast',

    // IPO
    IPO_WATCHER: 'ipo_watcher',
    GMP_HUNTER: 'gmp_hunter',
    ALLOTMENT_TRACKER: 'allotment_tracker',

    // Stocks
    SCREENER_PRO: 'screener_pro',
    WATCHLIST_BUILDER: 'watchlist_builder',
    COMPARER: 'comparer',

    // Streak
    EARLY_BIRD: 'early_bird',
    STAQQ_ADDICT: 'staqq_addict',
    PULSE_CHECKER: 'pulse_checker',

    // Rare
    DIAMOND_HANDS: 'diamond_hands',
    OG_STAQQ: 'og_staqq',
    FULL_STAQQ: 'full_staqq',
} as const;

export async function fetchAchievements() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

    if (error) {
        console.error('Error fetching achievements:', JSON.stringify(error, null, 2));
        return [];
    }
    return data as Achievement[];
}

export async function fetchUserAchievements(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user achievements:', error);
        return [];
    }
    return data as { achievement_id: string; unlocked_at: string }[];
}
