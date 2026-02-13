// ─── Market Pulse Data Layer ─────────────────────────────────────────
// Fetches live stock market discussions from Reddit (API) and
// Twitter/X (via data/tweets.json populated by twikit Python script).
// ─────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SocialPost {
    id: string;
    title: string;
    body: string;
    url: string;
    score: number;
    comments: number;
    source: 'reddit' | 'twitter';
    community: string;
    author: string | null;
    createdAt: number;
    tickers: string[];
    isHot: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────

const SUBREDDITS = [
    'IndianStreetBets',
    'IndiaInvestments',
    'DalalStreetTalks',
    'StockMarketIndia',
];

const IGNORE_WORDS = new Set([
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE',
    'WAS', 'BUT', 'ALL', 'ONE', 'OUT', 'GET', 'CAN', 'HAS', 'WHO', 'SEE',
    'NOW', 'NEW', 'BUY', 'SELL', 'GDP', 'RBI', 'INR', 'USD', 'IPO', 'LTCG',
    'STCG', 'ETF', 'SIP', 'PPF', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY',
    'MIDCAP', 'SMALLCAP', 'SEBI', 'AMC', 'NAV', 'NSE', 'BSE', 'FII', 'DII',
    'EDIT', 'UPDATE', 'TIL', 'PSA', 'IMO', 'TLDR', 'YOLO', 'FOMO', 'ATH',
    'RED', 'GREEN', 'BULL', 'BEAR', 'LONG', 'SHORT', 'CALL', 'PUT', 'ITM',
    'OTM', 'ATM', 'LOT', 'ANY', 'HOW', 'WHY', 'ITS', 'OUR', 'PAY', 'TAX',
    'NPS', 'LIC', 'DOES', 'BEEN', 'MUCH', 'JUST', 'WILL', 'WHAT', 'FROM',
    'THEY', 'THAN', 'SOME', 'YOUR', 'ALSO', 'VERY', 'MORE', 'MOST', 'ONLY',
    'OVER', 'SUCH', 'MAKE', 'LIKE', 'TIME', 'YEAR', 'EACH', 'KNOW', 'TAKE',
    'COME', 'WANT', 'GIVE', 'MANY', 'WELL', 'BACK', 'GOOD', 'BEST', 'LAST',
]);

// ─── Helpers ─────────────────────────────────────────────────────────

function extractTickers(text: string): string[] {
    const matches = text.match(/\b[A-Z]{3,10}\b/g) || [];
    const unique = [...new Set(matches.filter(m => !IGNORE_WORDS.has(m)))];
    return unique.slice(0, 5);
}

function truncateBody(text: string, maxLen = 300): string {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
}

// ─── Reddit Fetching ─────────────────────────────────────────────────

async function fetchRedditPosts(): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    for (const sub of SUBREDDITS) {
        try {
            const url = `https://www.reddit.com/r/${sub}/hot.json?limit=25`;
            const res = await fetch(url, {
                headers,
                next: { revalidate: 300 },
            });

            if (!res.ok) {
                console.error(`[Pulse] Reddit r/${sub} returned ${res.status}`);
                continue;
            }

            const data = await res.json();
            const children = data?.data?.children || [];

            for (const child of children) {
                const post = child.data;
                if (post.stickied) continue;

                const title = post.title || '';
                const body = post.selftext || '';
                const tickers = extractTickers(title + ' ' + body);
                const score = post.score || 0;
                const comments = post.num_comments || 0;

                if (score > 10 || tickers.length > 0) {
                    posts.push({
                        id: `reddit-${post.id}`,
                        title,
                        body: truncateBody(body),
                        url: post.url?.startsWith('/r/')
                            ? `https://reddit.com${post.url}`
                            : post.url || `https://reddit.com/r/${sub}/comments/${post.id}`,
                        score,
                        comments,
                        source: 'reddit',
                        community: sub,
                        author: post.author || null,
                        createdAt: post.created_utc || 0,
                        tickers,
                        isHot: score > 100 || comments > 50,
                    });
                }
            }
        } catch (err) {
            console.error(`[Pulse] Error fetching r/${sub}:`, err);
        }
    }

    return posts;
}

// ─── Twitter/X Fetching (reads from twikit JSON) ─────────────────────
// Reads tweets from data/tweets.json which is populated by the
// Python script: scripts/fetch_tweets.py (uses twikit library).

function loadTwitterPosts(): SocialPost[] {
    try {
        const tweetsPath = join(process.cwd(), 'data', 'tweets.json');

        if (!existsSync(tweetsPath)) {
            console.log('[Pulse] data/tweets.json not found — run: source .venv/bin/activate && python scripts/fetch_tweets.py');
            return [];
        }

        const raw = readFileSync(tweetsPath, 'utf-8');
        const data = JSON.parse(raw);

        const fetchedAt = data.fetchedAt || '';
        const posts: SocialPost[] = (data.posts || []).map((p: any) => ({
            id: p.id || '',
            title: p.title || '',
            body: p.body || '',
            url: p.url || '',
            score: p.score || 0,
            comments: p.comments || 0,
            source: 'twitter' as const,
            community: p.community || 'X / Twitter',
            author: p.author || null,
            createdAt: p.createdAt || 0,
            tickers: p.tickers || [],
            isHot: p.isHot || false,
        }));

        console.log(`[Pulse] Loaded ${posts.length} tweets from data/tweets.json (fetched: ${fetchedAt})`);
        return posts;
    } catch (err) {
        console.error('[Pulse] Error reading data/tweets.json:', err);
        return [];
    }
}

// ─── Public API ──────────────────────────────────────────────────────

export async function getAllPosts(): Promise<SocialPost[]> {
    const [redditPosts, twitterPosts] = await Promise.all([
        fetchRedditPosts(),
        Promise.resolve(loadTwitterPosts()),
    ]);

    console.log(`[Pulse] Total: ${redditPosts.length} Reddit + ${twitterPosts.length} Twitter = ${redditPosts.length + twitterPosts.length} posts`);

    const all = [...redditPosts, ...twitterPosts];

    // Sort: hot posts first, then by score descending, then recency
    all.sort((a, b) => {
        if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
        if (b.score !== a.score) return b.score - a.score;
        return b.createdAt - a.createdAt;
    });

    return all;
}

export async function getRedditPosts(): Promise<SocialPost[]> {
    return fetchRedditPosts();
}

export async function getTwitterPosts(): Promise<SocialPost[]> {
    return loadTwitterPosts();
}
