import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json().catch(() => ({}));

    if (body.all) {
        await supabase
            .from('user_notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);
    } else if (Array.isArray(body.notificationIds)) {
        await supabase
            .from('user_notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .in('id', body.notificationIds);
    }

    return NextResponse.json({ success: true });
}
