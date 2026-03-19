import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSubscriptionTier } from '@/lib/subscription';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tier = await getSubscriptionTier(user.id);
    if (tier !== 'pro') {
        return NextResponse.json({ error: 'Pro subscription required', upgrade: true }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('custom_alert_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tier = await getSubscriptionTier(user.id);
    if (tier !== 'pro') {
        return NextResponse.json({ error: 'Pro subscription required', upgrade: true }, { status: 403 });
    }

    const body = await req.json();
    const { name, conditions, actions, logic, cooldown_hours } = body;

    if (!name || !conditions || !Array.isArray(conditions) || conditions.length === 0) {
        return NextResponse.json({ error: 'name and conditions are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('custom_alert_rules')
        .insert({
            user_id: user.id,
            name,
            conditions,
            actions: actions || ['email', 'in_app'],
            logic: logic || 'AND',
            cooldown_hours: cooldown_hours ?? 4,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { data, error } = await supabase
        .from('custom_alert_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error } = await supabase
        .from('custom_alert_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
