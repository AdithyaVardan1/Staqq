/**
 * Supabase admin client for server-side operations that bypass Row Level Security.
 * Used specifically for newsletter subscriber management (no user session needed).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.warn(
            '[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Supabase features will be disabled.'
        );
        return null;
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
