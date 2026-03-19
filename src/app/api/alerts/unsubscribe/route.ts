import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker || typeof ticker !== 'string') {
        return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
        .from('alert_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('ticker', ticker.toUpperCase());

    if (error) {
        console.error('[Alerts/Unsubscribe]', error.message);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
