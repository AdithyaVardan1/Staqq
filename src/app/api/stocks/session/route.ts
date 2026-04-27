import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/supabase/mobile-auth';
import { angelOne } from '@/lib/angelone';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    try {
        const result = await angelOne.authenticate();

        if (result.success) {
            return NextResponse.json({
                success: true,
                jwtToken: result.data.jwtToken,
                feedToken: result.data.feedToken,
                clientCode: process.env.ANGEL_ONE_CLIENT_CODE,
            });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
