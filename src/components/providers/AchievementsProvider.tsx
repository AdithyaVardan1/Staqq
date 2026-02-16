"use client";

import { useEffect } from 'react';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { createClient } from '@/utils/supabase/client';
import AchievementToast from '../achievements/AchievementToast';

export default function AchievementsProvider({ children }: { children: React.ReactNode }) {
    const { initialize } = useAchievementsStore();
    const supabase = createClient();

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession();
            // Initialize with user ID if logged in, or just fetch definitions if guest
            await initialize(session?.user?.id);
        }
        init();

        // Listen for auth changes to re-init
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                initialize(session?.user?.id);
            }
            if (event === 'SIGNED_OUT') {
                // Clear achievements? reload page usually handles this
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [initialize, supabase]);

    return (
        <>
            {children}
            <AchievementToast />
        </>
    );
}
