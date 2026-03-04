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
            let safeSession = session;
            if (typeof session === 'string') {
                try {
                    safeSession = JSON.parse(session);
                } catch (e) {
                    console.error('Failed to parse session string in init:', e);
                }
            }
            // Initialize with user ID if logged in, or just fetch definitions if guest
            await initialize(safeSession?.user?.id);
        }
        init();

        // Listen for auth changes to re-init
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            let safeSession = session;
            if (typeof session === 'string') {
                try {
                    safeSession = JSON.parse(session);
                } catch (e) {
                    console.error('Failed to parse session string in auth change:', e);
                }
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                initialize(safeSession?.user?.id);
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
