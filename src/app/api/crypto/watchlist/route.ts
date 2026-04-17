import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('wallet_watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ wallets: data });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { wallet_address, chain, label } = await req.json();
    if (!wallet_address || !chain) {
        return NextResponse.json({ error: 'wallet_address and chain required' }, { status: 400 });
    }

    const { count } = await supabase
        .from('wallet_watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

    const isPro = !!sub;
    if (!isPro && (count ?? 0) >= 5) {
        return NextResponse.json({ error: 'Free plan limit: 5 wallets. Upgrade to Pro for unlimited.', limitHit: true }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('wallet_watchlist')
        .insert({ user_id: user.id, wallet_address: wallet_address.trim(), chain, label: label?.trim() || null })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return NextResponse.json({ error: 'Wallet already in watchlist' }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ wallet: data });
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { wallet_address } = await req.json();
    if (!wallet_address) return NextResponse.json({ error: 'wallet_address required' }, { status: 400 });

    const { error } = await supabase
        .from('wallet_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', wallet_address);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
