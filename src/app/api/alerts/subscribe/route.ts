import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { canAddAlertSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker || typeof ticker !== 'string') {
        return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
    }

    const normalized = ticker.toUpperCase().trim();
    if (normalized !== 'ALL' && !/^[A-Z&]{2,15}$/.test(normalized)) {
        return NextResponse.json({ error: 'Invalid ticker format' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check free-tier alert subscription limit
    const { count } = await admin
        .from('alert_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

    const canAdd = await canAddAlertSubscription(user.id, count ?? 0);
    if (!canAdd) {
        return NextResponse.json(
            { error: 'Free tier limited to 3 alert subscriptions', upgrade: true, current: count, limit: 3 },
            { status: 403 }
        );
    }

    const { error } = await admin
        .from('alert_subscriptions')
        .upsert(
            {
                user_id: user.id,
                ticker: normalized,
                email: user.email,
                is_active: true,
            },
            { onConflict: 'user_id,ticker' }
        );

    if (error) {
        console.error('[Alerts/Subscribe]', error.message);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ticker: normalized });
}
