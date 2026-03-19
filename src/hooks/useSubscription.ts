'use client';

import { useEffect } from 'react';
import { useSubscriptionStore, type SubscriptionTier } from '@/store/useSubscriptionStore';

interface UseSubscriptionReturn {
    tier: SubscriptionTier;
    isPro: boolean;
    isFree: boolean;
    planId: string;
    status: string;
    features: {
        stock_lookups_per_day: number;
        max_alert_subs: number;
        signal_delay_min: number;
        screener_export: boolean;
        custom_rules: boolean;
        morning_brief: boolean;
        ipo_score: boolean;
    };
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    usage: {
        stock_lookups: { current: number; limit: number };
    };
    loading: boolean;
    canUse: (feature: string) => boolean;
    refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
    const store = useSubscriptionStore();

    useEffect(() => {
        store.fetch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const canUse = (feature: string): boolean => {
        const f = store.features;
        switch (feature) {
            case 'screener_export':
                return f.screener_export;
            case 'custom_rules':
                return f.custom_rules;
            case 'morning_brief':
                return f.morning_brief;
            case 'ipo_score':
                return f.ipo_score;
            case 'real_time_signals':
                return f.signal_delay_min === 0;
            case 'unlimited_lookups':
                return f.stock_lookups_per_day === -1;
            case 'unlimited_alerts':
                return f.max_alert_subs === -1;
            default:
                return store.tier === 'pro';
        }
    };

    return {
        tier: store.tier,
        isPro: store.tier === 'pro',
        isFree: store.tier === 'free',
        planId: store.planId,
        status: store.status,
        features: store.features,
        periodEnd: store.periodEnd,
        cancelAtPeriodEnd: store.cancelAtPeriodEnd,
        usage: store.usage,
        loading: store.loading,
        canUse,
        refresh: store.fetch,
    };
}
