import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { createClient as createServerClient } from './server';

/**
 * Gets the authenticated user from a request.
 * Tries cookie-based auth first (web), then Bearer token (mobile).
 */
export async function getUserFromRequest(req: NextRequest) {
    // Try cookie-based auth first (web)
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;
    } catch {
        // Cookie auth failed, try Bearer
    }

    // Fall back to Bearer token (mobile)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await client.auth.getUser(token);
        return user;
    }

    return null;
}
