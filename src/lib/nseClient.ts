// ─── NSE India API Client ────────────────────────────────────────────
// Handles session cookie management for NSE India's anti-bot measures.
// All NSE API calls must go through this client.
// ─────────────────────────────────────────────────────────────────────

const NSE_BASE = 'https://www.nseindia.com';

const HEADERS: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
};

// In-memory cookie cache (shared across requests in same serverless invocation)
let cachedCookies: string | null = null;
let cookieExpiry = 0;

async function refreshCookies(): Promise<string> {
    const now = Date.now();
    if (cachedCookies && now < cookieExpiry) {
        return cachedCookies;
    }

    const res = await fetch(`${NSE_BASE}/report-detail/eq_security`, {
        headers: HEADERS,
        redirect: 'manual',
    });

    const setCookies = res.headers.getSetCookie?.() || [];
    const cookies = setCookies
        .map(c => c.split(';')[0])
        .join('; ');

    cachedCookies = cookies;
    cookieExpiry = now + 4 * 60 * 1000; // 4 minutes

    return cookies;
}

export async function nseGet<T = any>(path: string): Promise<T> {
    const cookies = await refreshCookies();

    const res = await fetch(`${NSE_BASE}${path}`, {
        headers: {
            ...HEADERS,
            'Cookie': cookies,
        },
        next: { revalidate: 900 }, // Cache 15 min
    });

    if (res.status === 401 || res.status === 403) {
        // Cookie expired, force refresh and retry once
        cachedCookies = null;
        cookieExpiry = 0;
        const newCookies = await refreshCookies();

        const retry = await fetch(`${NSE_BASE}${path}`, {
            headers: {
                ...HEADERS,
                'Cookie': newCookies,
            },
            next: { revalidate: 900 },
        });

        if (!retry.ok) {
            throw new Error(`NSE API error: ${retry.status} for ${path}`);
        }
        return retry.json();
    }

    if (!res.ok) {
        throw new Error(`NSE API error: ${res.status} for ${path}`);
    }

    return res.json();
}
