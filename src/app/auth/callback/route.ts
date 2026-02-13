import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    // TODO: Add Supabase auth session exchange when Supabase integration is enabled
    // const code = requestUrl.searchParams.get('code');

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/profile`);
}

