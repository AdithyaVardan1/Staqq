import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { getSubscription, getUsage } from '@/lib/subscription';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const [subscription, usage] = await Promise.all([
            getSubscription(user.id),
            getUsage(user.id, 'stock_lookups'),
        ]);

        return NextResponse.json({
            ...subscription,
            usage: {
                stock_lookups: usage,
            },
        });
    } catch (error: any) {
        console.error('[Billing/Subscription]', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
