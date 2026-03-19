import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { cancelRazorpaySubscription } from '@/lib/razorpay';
import { invalidateSubscriptionCache } from '@/lib/subscription';

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const admin = createAdminClient();

        // Get current subscription
        const { data: sub, error } = await admin
            .from('subscriptions')
            .select('id, plan_id, razorpay_subscription_id, status')
            .eq('user_id', user.id)
            .single();

        if (error || !sub) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        if (sub.plan_id === 'free') {
            return NextResponse.json({ error: 'Already on free plan' }, { status: 400 });
        }

        if (!sub.razorpay_subscription_id) {
            return NextResponse.json({ error: 'No payment subscription to cancel' }, { status: 400 });
        }

        // Cancel on Razorpay (at cycle end so user keeps access until period ends)
        await cancelRazorpaySubscription(sub.razorpay_subscription_id, true);

        // Update local record
        await admin
            .from('subscriptions')
            .update({
                cancel_at_period_end: true,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        await invalidateSubscriptionCache(user.id);

        return NextResponse.json({
            success: true,
            message: 'Subscription will be cancelled at the end of the current billing period',
        });
    } catch (error: any) {
        console.error('[Billing/Cancel]', error.message);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
