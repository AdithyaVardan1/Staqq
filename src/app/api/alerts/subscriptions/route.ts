import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);

    if (!user) {
        return NextResponse.json({ subscriptions: [] });
    }

    const supabase = await createClient();
    const { data } = await supabase
        .from('alert_subscriptions')
        .select('ticker, is_active, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return NextResponse.json({ subscriptions: data || [] });
}
