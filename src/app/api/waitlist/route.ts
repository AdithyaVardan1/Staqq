import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from('email_subscribers')
            .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

        if (error) {
            console.error('[Waitlist] Insert error:', error.message);
            return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
