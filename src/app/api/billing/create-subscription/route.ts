import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { createRazorpaySubscription, getOrCreateCustomer } from '@/lib/razorpay';

const PLAN_MAP: Record<string, string> = {
    pro_monthly: process.env.RAZORPAY_PLAN_ID_MONTHLY || '',
    pro_yearly: process.env.RAZORPAY_PLAN_ID_YEARLY || '',
};

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId || !PLAN_MAP[planId]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const razorpayPlanId = PLAN_MAP[planId];
    if (!razorpayPlanId) {
        return NextResponse.json({ error: 'Plan not configured' }, { status: 500 });
    }

    try {
        const admin = createAdminClient();

        // Check if user already has an active pro subscription
        const { data: existing } = await admin
            .from('subscriptions')
            .select('id, plan_id, status, razorpay_customer_id')
            .eq('user_id', user.id)
            .single();

        if (existing && existing.plan_id !== 'free' && existing.status === 'active') {
            return NextResponse.json(
                { error: 'Already subscribed to Pro' },
                { status: 409 }
            );
        }

        // Get or create Razorpay customer
        const customer = await getOrCreateCustomer({
            email: user.email!,
            name: user.user_metadata?.full_name,
            existingCustomerId: existing?.razorpay_customer_id,
        });

        // Create Razorpay subscription
        const subscription = await createRazorpaySubscription({
            planId: razorpayPlanId,
            customerId: customer.id,
            email: user.email!,
            name: user.user_metadata?.full_name,
        });

        // Store the customer ID if this is a new customer
        if (existing) {
            await admin
                .from('subscriptions')
                .update({
                    razorpay_customer_id: customer.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);
        }

        return NextResponse.json({
            subscriptionId: subscription.id,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            planId,
        });
    } catch (error: any) {
        console.error('[Billing/CreateSubscription]', error.message);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
