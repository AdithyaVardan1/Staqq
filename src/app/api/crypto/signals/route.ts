import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { getSubscription } from '@/lib/subscription';
import { getCryptoSignals } from '@/lib/crypto-signals';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        let isPro = false;

        if (user) {
            const sub = await getSubscription(user.id);
            isPro = sub.tier === 'pro';
        }

        const signals = await getCryptoSignals(isPro);
        return NextResponse.json({ signals, count: signals.length });
    } catch (error: any) {
        console.error('[Crypto Signals API]', error.message);
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }
}
