import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(req: NextRequest) {
    // Simple admin check via cron secret (or extend with Supabase session check)
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('is_active, subscribed_at');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = data.length;
    const active = data.filter(s => s.is_active).length;
    const unsubscribed = total - active;

    // New this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = data.filter(
        s => s.is_active && new Date(s.subscribed_at) >= oneWeekAgo
    ).length;

    return NextResponse.json({ total, active, unsubscribed, newThisWeek });
}
