import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('user_notifications')
        .select(`
            id,
            read,
            created_at,
            delivered_via,
            alert:alerts (
                id,
                ticker,
                mention_count,
                spike_mult,
                baseline_avg,
                message,
                top_post_url,
                top_post_title,
                detected_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('[Notifications]', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notifications = data || [];
    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
}
