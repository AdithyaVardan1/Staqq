import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { invalidateSubscriptionCache } from '@/lib/subscription';
import { getEmailProvider } from '@/lib/email';
import { buildWelcomeProEmail } from '@/lib/emailTemplates/welcomePro';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let isValid = false;
    try {
        isValid = verifyWebhookSignature(body, signature);
    } catch {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventId = event.event_id || event.id || `${event.event}_${Date.now()}`;
    const eventType = event.event;

    const admin = createAdminClient();

    // Idempotency check
    const { data: existingEvent } = await admin
        .from('razorpay_events')
        .select('id')
        .eq('event_id', eventId)
        .single();

    if (existingEvent) {
        return NextResponse.json({ status: 'already_processed' });
    }

    // Log the event
    await admin.from('razorpay_events').insert({
        event_id: eventId,
        event_type: eventType,
        payload: event,
        processed: false,
    });

    try {
        const payload = event.payload;

        switch (eventType) {
            case 'subscription.activated': {
                const sub = payload.subscription?.entity;
                if (!sub) break;

                const customerEmail = sub.notes?.email || payload.payment?.entity?.email;
                await activateSubscription(admin, sub, customerEmail);
                break;
            }

            case 'subscription.charged': {
                const sub = payload.subscription?.entity;
                if (!sub) break;

                await updateSubscriptionPeriod(admin, sub);
                break;
            }

            case 'subscription.halted':
            case 'subscription.pending': {
                const sub = payload.subscription?.entity;
                if (!sub) break;

                await setSubscriptionStatus(admin, sub.id, 'past_due');
                break;
            }

            case 'subscription.cancelled': {
                const sub = payload.subscription?.entity;
                if (!sub) break;

                await setSubscriptionStatus(admin, sub.id, 'cancelled');
                break;
            }

            case 'subscription.completed': {
                const sub = payload.subscription?.entity;
                if (!sub) break;

                await setSubscriptionStatus(admin, sub.id, 'expired');
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event: ${eventType}`);
        }

        // Mark event as processed
        await admin
            .from('razorpay_events')
            .update({ processed: true })
            .eq('event_id', eventId);

        return NextResponse.json({ status: 'processed' });
    } catch (error: any) {
        console.error(`[Webhook] Error processing ${eventType}:`, error.message);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}

// ─── Helper Functions ────────────────────────────────────────────────

async function activateSubscription(
    admin: ReturnType<typeof createAdminClient>,
    razorpaySub: any,
    customerEmail?: string
) {
    // Find user by Razorpay customer ID or email from notes
    const { data: existing } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('razorpay_customer_id', razorpaySub.customer_id)
        .single();

    if (!existing) {
        console.error('[Webhook] No subscription found for customer:', razorpaySub.customer_id);
        return;
    }

    const periodStart = razorpaySub.current_start
        ? new Date(razorpaySub.current_start * 1000).toISOString()
        : new Date().toISOString();
    const periodEnd = razorpaySub.current_end
        ? new Date(razorpaySub.current_end * 1000).toISOString()
        : null;

    // Determine plan from Razorpay plan ID
    const planId = razorpaySub.plan_id === process.env.RAZORPAY_PLAN_ID_YEARLY
        ? 'pro_yearly'
        : 'pro_monthly';

    await admin
        .from('subscriptions')
        .update({
            plan_id: planId,
            status: 'active',
            razorpay_subscription_id: razorpaySub.id,
            razorpay_payment_method: razorpaySub.payment_method || 'unknown',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            cancelled_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', existing.user_id);

    await invalidateSubscriptionCache(existing.user_id);
    console.log(`[Webhook] Activated pro for user ${existing.user_id}`);

    // Send welcome email
    if (customerEmail) {
        try {
            const name = razorpaySub.notes?.name || customerEmail.split('@')[0];
            await getEmailProvider().send({
                to: customerEmail,
                from: process.env.EMAIL_FROM ?? 'Staqq <hello@staqq.in>',
                subject: 'Welcome to Staqq Pro!',
                html: buildWelcomeProEmail(name),
            });
        } catch (err: any) {
            console.error('[Webhook] Welcome email failed:', err.message);
        }
    }
}

async function updateSubscriptionPeriod(
    admin: ReturnType<typeof createAdminClient>,
    razorpaySub: any
) {
    const { data: existing } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('razorpay_subscription_id', razorpaySub.id)
        .single();

    if (!existing) return;

    const periodStart = razorpaySub.current_start
        ? new Date(razorpaySub.current_start * 1000).toISOString()
        : undefined;
    const periodEnd = razorpaySub.current_end
        ? new Date(razorpaySub.current_end * 1000).toISOString()
        : undefined;

    const updates: Record<string, unknown> = {
        status: 'active',
        updated_at: new Date().toISOString(),
    };
    if (periodStart) updates.current_period_start = periodStart;
    if (periodEnd) updates.current_period_end = periodEnd;

    await admin
        .from('subscriptions')
        .update(updates)
        .eq('razorpay_subscription_id', razorpaySub.id);

    await invalidateSubscriptionCache(existing.user_id);
}

async function setSubscriptionStatus(
    admin: ReturnType<typeof createAdminClient>,
    razorpaySubId: string,
    status: string
) {
    const { data: existing } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('razorpay_subscription_id', razorpaySubId)
        .single();

    if (!existing) return;

    const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
    }

    // If cancelled or expired, revert to free plan
    if (status === 'cancelled' || status === 'expired') {
        updates.plan_id = 'free';
        updates.razorpay_subscription_id = null;
        updates.current_period_start = null;
        updates.current_period_end = null;
    }

    await admin
        .from('subscriptions')
        .update(updates)
        .eq('razorpay_subscription_id', razorpaySubId);

    await invalidateSubscriptionCache(existing.user_id);
    console.log(`[Webhook] Set subscription ${razorpaySubId} to ${status}`);
}
