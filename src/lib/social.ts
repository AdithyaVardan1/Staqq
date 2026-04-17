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
    image?: string;
}

// ─── Config ──────────────────────────────────────────────────────────

const SUBREDDITS = [
    'IndianStockMarket', // Very active
    'IndianStreetBets',
    'IndiaInvestments',
    'DalalStreetTalks',
];

const IGNORE_WORDS = new Set([
    // English common words (2-4 letters)
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE',
    'WAS', 'BUT', 'ALL', 'ONE', 'OUT', 'GET', 'CAN', 'HAS', 'WHO', 'SEE',
    'NOW', 'NEW', 'ANY', 'HOW', 'WHY', 'ITS', 'OUR', 'PAY', 'USE', 'WAY',
    'MAY', 'DAY', 'TRY', 'SAY', 'HIS', 'HER', 'HIM', 'TWO', 'OLD', 'BIG',
    'END', 'OWN', 'SET', 'RUN', 'ADD', 'ASK', 'OFF', 'LET', 'TOP', 'FEW',
    'FAR', 'BAD', 'AGO', 'LOT', 'YET', 'DID', 'GOT', 'SAT', 'CUT', 'MET',
    // English common words (5+ letters)
    'DOES', 'BEEN', 'MUCH', 'JUST', 'WILL', 'WHAT', 'FROM', 'THEY', 'THAN',
    'SOME', 'YOUR', 'ALSO', 'VERY', 'MORE', 'MOST', 'ONLY', 'OVER', 'SUCH',
    'MAKE', 'LIKE', 'TIME', 'YEAR', 'EACH', 'KNOW', 'TAKE', 'COME', 'WANT',
    'GIVE', 'MANY', 'WELL', 'BACK', 'GOOD', 'BEST', 'LAST', 'HELP', 'NEXT',
    'FIVE', 'DAYS', 'LIVE', 'DOWN', 'CASE', 'NOTE', 'UNDER', 'PRESS', 'EARLY',
    'MONEY', 'TOUCH', 'ALWAYS', 'NEVER', 'TODAY', 'PHASE', 'ABOUT', 'AFTER',
    'AGAIN', 'STILL', 'THINK', 'THOSE', 'WHERE', 'WHICH', 'THEIR', 'OTHER',
    'BEING', 'WOULD', 'COULD', 'SHOULD', 'MIGHT', 'EVERY', 'FIRST', 'GREAT',
    'FOUND', 'GOING', 'USING', 'DOING', 'BASED', 'SINCE', 'UNTIL', 'WHILE',
    'WATCH', 'BANKS', 'THEM', 'TEST', 'RICE', 'RELEASE', 'UPDATES', 'BREAKING',
    'FINANCIAL', 'RETIRE', 'MILITARY', 'ACADEMY', 'DEFENCE',
    // Market/finance jargon (not tickers)
    'BUY', 'SELL', 'GDP', 'RBI', 'INR', 'USD', 'IPO', 'LTCG', 'STCG',
    'ETF', 'SIP', 'PPF', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY',
    'MIDCAP', 'SMALLCAP', 'SEBI', 'AMC', 'NAV', 'NSE', 'BSE', 'FII', 'DII',
    'ATH', 'RED', 'GREEN', 'BULL', 'BEAR', 'LONG', 'SHORT', 'CALL', 'PUT',
    'ITM', 'OTM', 'ATM', 'NPS', 'LIC', 'TAX', 'EMI', 'ROI', 'CAGR', 'XIRR',
    'QOQ', 'YOY', 'MOM', 'FPO', 'OFS', 'AGM', 'EGM', 'ESOP', 'ESPP',
    'HNI', 'RHP', 'DRHP', 'GMP', 'AUM', 'TER', 'ELSS', 'ULIP',
    'DIY', 'FIRE', 'BTST', 'STBT', 'CNC', 'MIS', 'NRML',
    'RSI', 'MACD', 'EMA', 'SMA', 'DMA', 'VWAP',
    // Chart/trading terms
    'EPS', 'PE', 'PB', 'CE', 'IV', 'OI', 'SL', 'TP',
    // Reddit/internet slang
    'EDIT', 'UPDATE', 'TIL', 'PSA', 'IMO', 'TLDR', 'YOLO', 'FOMO', 'AMA',
    'TBH', 'LMAO', 'IMHO', 'AFAIK', 'IIRC', 'NSFW',
    // Countries / regions / orgs
    'US', 'USA', 'UK', 'EU', 'UN', 'UAE', 'NRI', 'OPEC', 'IRAN', 'NATO',
    // Tech/general abbreviations
    'AI', 'ML', 'AGI', 'ASI', 'GPT', 'LLM', 'PDF', 'URL', 'API', 'CSS',
    'UI', 'UX', 'IT', 'HR', 'PR', 'QA', 'ID', 'PIN', 'CC', 'DD', 'DM',
    'PM', 'FM', 'AM', 'AA', 'BB', 'HO', 'DO', 'NS',
    // Finance terms that look like tickers
    'FD', 'RD', 'MF', 'PF', 'HUF', 'PAN', 'GST', 'STT', 'CTT',
    'LTCL', 'STCL', 'CPI', 'WPI', 'HRA', 'LRS', 'FBAR', 'PFIC',
    'IRS', 'CPA', 'NRE', 'NRO', 'SSO', 'EPF', 'VPF',
    'FDI', 'FPI', 'QFI', 'PMS', 'AIF', 'HFT', 'LDR',
    'REITS', 'INVITS', 'ULIPS', 'BMI', 'IVR', 'IVF',
    'PSU', 'NBFC', 'PVT', 'LTD', 'SME', 'SMC',
    // Crypto (not stock tickers)
    'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'ADA', 'XRP', 'DOGE',
    // Fund/index names (not individual stocks)
    'VTI', 'SPY', 'QQQ', 'VOO', 'FTSE', 'NASDAQ', 'DJIA',
    'CRSP', 'DFIV', 'DFSV', 'AVUV', 'MSCI',
    // Common words that are also short
    'FIN', 'WAR', 'BANK', 'GOLD', 'SEP', 'CFO', 'CEO', 'CTO', 'COO',
    'IMD', 'AMFI', 'PED', 'RR', 'ABC', 'PPL', 'RM', 'FY',
    'SENP', 'LNG', 'III', 'RTD', 'SNA', 'NK', 'QE', 'LPG',
    'NSDL', 'PROTEAN', 'ITR', 'VIX', 'SPR', 'SLM',
    // Common English words 3+ letters that get matched
    'DOUBLED', 'EIGHT', 'WEEKS', 'TWICE', 'CLUSTER', 'WARHEAD', 'CNN', 'NBC',
    'NOT', 'THE', 'ARE', 'WAS', 'HAS', 'HAD', 'HIS', 'HER', 'HIM', 'WHO',
    'THAT', 'THIS', 'WHAT', 'WILL', 'CAN', 'GET', 'GOT', 'PUT', 'RUN',
    'SAY', 'SAID', 'SAYS', 'SEE', 'SAW', 'SEEN', 'USE', 'USED', 'SET',
    'WAY', 'MAY', 'DAY', 'TRY', 'ASK', 'OWN', 'ADD', 'END', 'BIG',
    'OLD', 'NEW', 'TWO', 'FEW', 'FAR', 'BAD', 'TOP', 'OFF', 'YET',
    'AGO', 'LOT', 'CUT', 'MET', 'LET', 'SAT', 'DID', 'BIT',
    'HIGH', 'LOW', 'LOOK', 'NEED', 'KEEP', 'SHOW', 'MOVE', 'WORK',
    'PART', 'FACT', 'HAND', 'MUST', 'REAL', 'SURE', 'FREE', 'EVEN',
    'FULL', 'HALF', 'LATE', 'TRUE', 'OPEN', 'HARD', 'SAME', 'ABLE',
    'FOUR', 'NINE', 'ZERO', 'ONCE', 'LEFT', 'LINE', 'HEAD', 'RATE',
    'RULE', 'RISK', 'SAFE', 'LOSS', 'GAIN', 'PICK', 'HOLD', 'DROP',
    'RISE', 'FALL', 'SEEN', 'PLAN', 'GOES', 'GONE', 'DONE', 'MADE',
    'TOLD', 'TOOK', 'PAID', 'SENT', 'GAVE', 'LOST', 'KEPT',
    'THINK', 'THING', 'THINGS', 'RIGHT', 'POINT', 'STOCK', 'STOCKS',
    'SHARE', 'SHARES', 'TRADE', 'TRADES', 'PRICE', 'MARKET',
    'VALUE', 'LEVEL', 'BELOW', 'ABOVE', 'START', 'SMALL', 'LARGE',
    'TOTAL', 'WORTH', 'MONTH', 'YEARS', 'DAILY', 'WEEKLY', 'ANNUAL',
    'AROUND', 'INVEST', 'PROFIT', 'GROWTH', 'RETURN', 'INCOME',
    'AMOUNT', 'OPTION', 'OPTIONS', 'FUTURE', 'FUTURES', 'DIRECT',
    'MUTUAL', 'EQUITY', 'SECTOR', 'INDEX', 'LISTED', 'UNLISTED',
    'BETWEEN', 'THROUGH', 'ACROSS', 'DURING', 'BEFORE', 'ANOTHER',
    'PLEASE', 'REALLY', 'PEOPLE', 'ANYONE', 'SECOND', 'SIMPLY', 'NUMBER',
    // News/media
    'NEWS', 'POST', 'THREAD', 'ARTICLE', 'SOURCE', 'REPORT', 'ALERT',
    // Geopolitics that aren't stock tickers
    'ASEAN', 'IEEPA', 'NATO', 'FATCA', 'ISRO', 'IAS', 'IPS', 'NLP',
    // P&L is not a ticker
    'P&L',
    // More crypto
    'XLM', 'DOT', 'AVAX', 'MATIC', 'SHIB', 'LINK', 'UNI',
    // More fund names / indices
    'SPHQ', 'SCHD', 'VXUS',
    // Words that look like tickers but aren't
    'INSIDE', 'BILLION', 'MILLION', 'THOUSAND', 'HUNDRED',
    'IRGC', 'THAAD', 'CBS', 'ABC', 'FOX', 'HBO',
    'BOM', 'GIRIBSE', 'BSESME',
    // Finance terms
    'TDS', 'GBP', 'AUD', 'EUR', 'JPY', 'CNY', 'CAD', 'CHF',
    'CGAS', 'CPC', 'SGB', 'CBOI',
]);

// ─── Helpers ─────────────────────────────────────────────────────────

function extractTickers(text: string): string[] {
    // Match tickers with & (e.g. M&M, L&TFH) - allow 2+ chars total
    // Match standard tickers (3-10 uppercase letters only, no 2-letter matches)
    const ampMatches = text.match(/\b[A-Z]{1,5}&[A-Z]{1,5}\b/g) || [];
    const stdMatches = text.match(/\b[A-Z]{3,10}\b/g) || [];
    const all = [...ampMatches, ...stdMatches];
    const filtered = all.filter(m => !IGNORE_WORDS.has(m));
    const unique = [...new Set(filtered)];
    return unique.slice(0, 8);
}

function truncateBody(text: string, maxLen = 300): string {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
}

function decodeHtmlEntities(text: string): string {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}

// ─── Reddit Fetching ─────────────────────────────────────────────────

async function fetchRedditPosts(): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const seenIds = new Set<string>();
    const headers = {
        'User-Agent': 'Staqq/1.0 (Indian stock market intelligence; contact@staqq.com)',
    };

    // Fetch both hot and new for each subreddit to maximize coverage
    const fetchUrls: { sub: string; url: string }[] = [];
    for (const sub of SUBREDDITS) {
        fetchUrls.push(
            { sub, url: `https://www.reddit.com/r/${sub}/hot.json?limit=50` },
            { sub, url: `https://www.reddit.com/r/${sub}/new.json?limit=50` },
        );
    }

    const results = await Promise.allSettled(
        fetchUrls.map(async ({ sub, url }) => {
            const res = await fetch(url, {
                headers,
                next: { revalidate: 300 },
            });
            if (!res.ok) {
                console.error(`[Pulse] Reddit r/${sub} returned ${res.status} for ${url}`);
                return { sub, children: [] };
            }
            const data = await res.json();
            return { sub, children: data?.data?.children || [] };
        })
    );

    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const { sub, children } = result.value;

        for (const child of children) {
            const post = child.data;
            if (post.stickied) continue;

            const postId = `reddit-${post.id}`;
            if (seenIds.has(postId)) continue; // Deduplicate across hot/new
            seenIds.add(postId);

            const title = decodeHtmlEntities(post.title || '');
            const body = decodeHtmlEntities(post.selftext || '');
            const tickers = extractTickers(title + ' ' + body);
            const score = post.score || 0;
            const comments = post.num_comments || 0;

            let image = undefined;
            if (post.post_hint === 'image' && post.url) {
                image = post.url;
            } else if (post.preview?.images?.[0]?.source?.url) {
                image = post.preview.images[0].source.url.replace('&amp;', '&');
            } else if (post.gallery_data?.items?.[0]?.media_id) {
                const mediaId = post.gallery_data.items[0].media_id;
                const meta = post.media_metadata?.[mediaId];
                if (meta?.s?.u) {
                    image = meta.s.u.replace('&amp;', '&');
                }
            }

            if (score > 10 || tickers.length > 0) {
                posts.push({
                    id: postId,
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
                    image,
                });
            }
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
            title: decodeHtmlEntities(p.title || ''),
            body: decodeHtmlEntities(p.body || ''),
            url: p.url || '',
            score: p.score || 0,
            comments: p.comments || 0,
            source: 'twitter' as const,
            community: p.community || 'X / Twitter',
            author: p.author || null,
            createdAt: p.createdAt || 0,
            tickers: p.tickers || [],
            isHot: p.isHot || false,
            image: p.image || undefined,
        }));

        console.log(`[Pulse] Loaded ${posts.length} tweets from data/tweets.json (fetched: ${fetchedAt})`);
        return posts;
    } catch (err) {
        console.error('[Pulse] Error reading data/tweets.json:', err);
        return [];
    }
}

// ─── Public API ──────────────────────────────────────────────────────

export async function getAllPosts(limit?: number): Promise<SocialPost[]> {
    const [redditPosts, twitterPosts] = await Promise.all([
        fetchRedditPosts(),
        Promise.resolve(loadTwitterPosts()),
    ]);

    const all = [...redditPosts, ...twitterPosts];
    console.log(`[Pulse] Fetched ${all.length} total posts (${redditPosts.length} Reddit, ${twitterPosts.length} Twitter).`);

    // Sort: Newest to Oldest (strict chronological)
    all.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? all.slice(0, limit) : all;
}

export async function getRedditPosts(): Promise<SocialPost[]> {
    return fetchRedditPosts();
}

export async function getTwitterPosts(): Promise<SocialPost[]> {
    return loadTwitterPosts();
}

export async function getTrendingTickers(): Promise<string[]> {
    const posts = await getAllPosts();
    const tickerCounts: Record<string, number> = {};

    for (const post of posts) {
        for (const ticker of post.tickers) {
            tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
        }
    }

    return Object.entries(tickerCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([ticker]) => ticker)
        .slice(0, 20);
}
