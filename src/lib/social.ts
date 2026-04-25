import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import Parser from 'rss-parser';
import { createAdminClient } from '@/utils/supabase/admin';

export interface SocialPost {
    id: string;
    title: string;
    body: string;
    url: string;
    score: number;
    comments: number;
    source: 'news' | 'twitter' | 'reddit';
    community: string;
    author: string | null;
    createdAt: number;
    tickers: string[];
    isHot: boolean;
    image?: string;
}

// ─── RSS News Feeds ───────────────────────────────────────────────────

const NEWS_FEEDS = [
    { url: 'https://www.livemint.com/rss/markets',                          label: 'LiveMint' },
    { url: 'https://feeds.feedburner.com/ndtvprofit-latest',                label: 'NDTV Profit' },
    { url: 'https://www.thehindubusinessline.com/markets/feeder/default.rss', label: 'BusinessLine' },
    { url: 'https://www.moneycontrol.com/rss/marketreports.xml',            label: 'Moneycontrol' },
];

const IGNORE_WORDS = new Set([
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE',
    'WAS', 'BUT', 'ALL', 'ONE', 'OUT', 'GET', 'CAN', 'HAS', 'WHO', 'SEE',
    'NOW', 'NEW', 'ANY', 'HOW', 'WHY', 'ITS', 'OUR', 'PAY', 'USE', 'WAY',
    'MAY', 'DAY', 'TRY', 'SAY', 'HIS', 'HER', 'HIM', 'TWO', 'OLD', 'BIG',
    'END', 'OWN', 'SET', 'RUN', 'ADD', 'ASK', 'OFF', 'LET', 'TOP', 'FEW',
    'FAR', 'BAD', 'AGO', 'LOT', 'YET', 'DID', 'GOT', 'SAT', 'CUT', 'MET',
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
    'BUY', 'SELL', 'GDP', 'RBI', 'INR', 'USD', 'IPO', 'LTCG', 'STCG',
    'ETF', 'SIP', 'PPF', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY',
    'MIDCAP', 'SMALLCAP', 'SEBI', 'AMC', 'NAV', 'NSE', 'BSE', 'FII', 'DII',
    'ATH', 'RED', 'GREEN', 'BULL', 'BEAR', 'LONG', 'SHORT', 'CALL', 'PUT',
    'ITM', 'OTM', 'ATM', 'NPS', 'LIC', 'TAX', 'EMI', 'ROI', 'CAGR', 'XIRR',
    'QOQ', 'YOY', 'MOM', 'FPO', 'OFS', 'AGM', 'EGM', 'ESOP', 'ESPP',
    'HNI', 'RHP', 'DRHP', 'GMP', 'AUM', 'TER', 'ELSS', 'ULIP',
    'DIY', 'FIRE', 'BTST', 'STBT', 'CNC', 'MIS', 'NRML',
    'RSI', 'MACD', 'EMA', 'SMA', 'DMA', 'VWAP',
    'EPS', 'PE', 'PB', 'CE', 'IV', 'OI', 'SL', 'TP',
    'EDIT', 'UPDATE', 'TIL', 'PSA', 'IMO', 'TLDR', 'YOLO', 'FOMO', 'AMA',
    'TBH', 'LMAO', 'IMHO', 'AFAIK', 'IIRC', 'NSFW',
    'US', 'USA', 'UK', 'EU', 'UN', 'UAE', 'NRI', 'OPEC', 'IRAN', 'NATO',
    'AI', 'ML', 'AGI', 'ASI', 'GPT', 'LLM', 'PDF', 'URL', 'API', 'CSS',
    'UI', 'UX', 'IT', 'HR', 'PR', 'QA', 'ID', 'PIN', 'CC', 'DD', 'DM',
    'PM', 'FM', 'AM', 'AA', 'BB', 'HO', 'DO', 'NS',
    'FD', 'RD', 'MF', 'PF', 'HUF', 'PAN', 'GST', 'STT', 'CTT',
    'LTCL', 'STCL', 'CPI', 'WPI', 'HRA', 'LRS', 'FBAR', 'PFIC',
    'IRS', 'CPA', 'NRE', 'NRO', 'SSO', 'EPF', 'VPF',
    'FDI', 'FPI', 'QFI', 'PMS', 'AIF', 'HFT', 'LDR',
    'REITS', 'INVITS', 'ULIPS', 'BMI', 'IVR', 'IVF',
    'PSU', 'NBFC', 'PVT', 'LTD', 'SME', 'SMC',
    'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'ADA', 'XRP', 'DOGE',
    'VTI', 'SPY', 'QQQ', 'VOO', 'FTSE', 'NASDAQ', 'DJIA',
    'CRSP', 'DFIV', 'DFSV', 'AVUV', 'MSCI',
    'FIN', 'WAR', 'BANK', 'GOLD', 'SEP', 'CFO', 'CEO', 'CTO', 'COO',
    'IMD', 'AMFI', 'PED', 'RR', 'ABC', 'PPL', 'RM', 'FY',
    'SENP', 'LNG', 'III', 'RTD', 'SNA', 'NK', 'QE', 'LPG',
    'NSDL', 'PROTEAN', 'ITR', 'VIX', 'SPR', 'SLM',
    'CNN', 'NBC', 'CBS', 'ABC', 'FOX', 'HBO', 'IRGC', 'THAAD',
    'BOM', 'GIRIBSE', 'BSESME',
    'TDS', 'GBP', 'AUD', 'EUR', 'JPY', 'CNY', 'CAD', 'CHF',
    'CGAS', 'CPC', 'SGB', 'CBOI',
    'NEWS', 'POST', 'REPORT', 'ALERT', 'BREAKING', 'LATEST',
    'STOCK', 'STOCKS', 'SHARE', 'SHARES', 'TRADE', 'TRADES',
    'PRICE', 'MARKET', 'VALUE', 'LEVEL', 'BELOW', 'ABOVE',
    'TOTAL', 'WORTH', 'MONTH', 'YEARS', 'DAILY', 'WEEKLY', 'ANNUAL',
    'AROUND', 'INVEST', 'PROFIT', 'GROWTH', 'RETURN', 'INCOME',
    'AMOUNT', 'OPTION', 'OPTIONS', 'FUTURE', 'FUTURES', 'DIRECT',
    'MUTUAL', 'EQUITY', 'SECTOR', 'INDEX', 'LISTED', 'UNLISTED',
    'BETWEEN', 'THROUGH', 'ACROSS', 'DURING', 'BEFORE', 'ANOTHER',
    'PLEASE', 'REALLY', 'PEOPLE', 'ANYONE', 'SECOND', 'SIMPLY', 'NUMBER',
    'INSIDE', 'BILLION', 'MILLION', 'THOUSAND', 'HUNDRED',
    'HIGH', 'LOW', 'LOOK', 'NEED', 'KEEP', 'SHOW', 'MOVE', 'WORK',
    'PART', 'FACT', 'HAND', 'MUST', 'REAL', 'SURE', 'FREE', 'EVEN',
    'FULL', 'HALF', 'LATE', 'TRUE', 'OPEN', 'HARD', 'SAME', 'ABLE',
    'RATE', 'RULE', 'RISK', 'SAFE', 'LOSS', 'GAIN', 'PICK', 'HOLD',
    'RISE', 'FALL', 'PLAN', 'DONE', 'MADE', 'TOLD', 'TOOK', 'PAID',
    'THINK', 'THING', 'THINGS', 'RIGHT', 'POINT',
    'P&L', 'XLM', 'DOT', 'AVAX', 'MATIC', 'SHIB', 'LINK', 'UNI',
    'SPHQ', 'SCHD', 'VXUS',
]);

function extractTickers(text: string): string[] {
    const ampMatches = text.match(/\b[A-Z]{1,5}&[A-Z]{1,5}\b/g) || [];
    const stdMatches = text.match(/\b[A-Z]{3,10}\b/g) || [];
    const all = [...ampMatches, ...stdMatches];
    const filtered = all.filter(m => !IGNORE_WORDS.has(m));
    return [...new Set(filtered)].slice(0, 8);
}

function truncateBody(text: string, maxLen = 300): string {
    if (!text || text.length <= maxLen) return text || '';
    return text.slice(0, maxLen) + '...';
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ─── News Feed Fetching ───────────────────────────────────────────────

async function fetchNewsFeedPosts(): Promise<SocialPost[]> {
    const parser = new Parser({ timeout: 8000 });
    const posts: SocialPost[] = [];
    const seenIds = new Set<string>();

    const results = await Promise.allSettled(
        NEWS_FEEDS.map(({ url, label }) =>
            parser.parseURL(url).then(feed => ({ label, items: feed.items }))
        )
    );

    for (const result of results) {
        if (result.status !== 'fulfilled') {
            console.error('[News] Feed failed:', (result as any).reason?.message);
            continue;
        }
        const { label, items } = result.value;

        for (const item of items) {
            const id = `news-${label}-${item.guid || item.link}`;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            const title = stripHtml(item.title || '');
            const body = truncateBody(stripHtml(item.contentSnippet || item.content || item.summary || ''));
            if (!title) continue;

            const createdAt = item.pubDate
                ? Math.floor(new Date(item.pubDate).getTime() / 1000)
                : Math.floor(Date.now() / 1000);

            const tickers = extractTickers(title.toUpperCase() + ' ' + body.toUpperCase());

            // Extract image from media:content if available
            const mediaItem = item as any;
            const image: string | undefined =
                mediaItem['media:content']?.['$']?.url ||
                mediaItem.enclosure?.url ||
                undefined;

            posts.push({
                id,
                title,
                body,
                url: item.link || '',
                score: 0,
                comments: 0,
                source: 'news',
                community: label,
                author: item.creator || null,
                createdAt,
                tickers,
                isHot: false,
                image,
            });
        }
    }

    console.log(`[News] Fetched ${posts.length} articles from ${NEWS_FEEDS.length} feeds`);
    return posts;
}

// ─── Reddit (public JSON, no API key) ────────────────────────────────
// Reddit's .json endpoint is public and rate-limited (~1 req/sec).
// Works from most IPs. If a subreddit 403s (private/restricted), it's
// skipped gracefully via Promise.allSettled.

const SUBREDDITS = [
    'IndianStockMarket',
    'IndianStreetBets',
    'IndiaInvestments',
    'DalalStreetTalks',
];

const REDDIT_UA = 'Staqq/1.0 (Indian stock market app; contact@staqq.com)';

async function fetchRedditPosts(): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const seenIds = new Set<string>();

    const fetchUrls = SUBREDDITS.flatMap(sub => [
        { sub, url: `https://www.reddit.com/r/${sub}/hot.json?limit=50` },
        { sub, url: `https://www.reddit.com/r/${sub}/new.json?limit=50` },
    ]);

    const results = await Promise.allSettled(
        fetchUrls.map(async ({ sub, url }) => {
            const res = await fetch(url, {
                headers: { 'User-Agent': REDDIT_UA },
                next: { revalidate: 300 },
            });
            if (!res.ok) {
                console.warn(`[Reddit] r/${sub} returned ${res.status} — skipping`);
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

            const id = `reddit-${post.id}`;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            const title = decodeHtmlEntities(post.title || '');
            const body = truncateBody(decodeHtmlEntities(post.selftext || ''));
            const score = post.score || 0;
            const comments = post.num_comments || 0;
            const tickers = extractTickers(title.toUpperCase() + ' ' + body.toUpperCase());

            if (score < 5 && tickers.length === 0) continue;

            let image: string | undefined;
            if (post.post_hint === 'image' && post.url) {
                image = post.url;
            } else if (post.preview?.images?.[0]?.source?.url) {
                image = post.preview.images[0].source.url.replace('&amp;', '&');
            }

            posts.push({
                id,
                title,
                body,
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

    console.log(`[Reddit] Fetched ${posts.length} posts`);
    return posts;
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x2F;/g, '/');
}

// ─── Twitter/X (Supabase-backed) ─────────────────────────────────────
// fetch_tweets.py writes to the `tweets` Supabase table.
// This reads from there in production. Falls back to local JSON in dev.

async function loadTwitterPosts(): Promise<SocialPost[]> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('tweets')
            .select('*')
            .gte('created_at_ts', Math.floor(Date.now() / 1000) - 86400)
            .order('created_at_ts', { ascending: false })
            .limit(100);

        if (!error && data && data.length > 0) {
            console.log(`[Twitter] Loaded ${data.length} tweets from Supabase`);
            return data.map((t: any) => ({
                id: t.post_id,
                title: t.title || '',
                body: t.body || '',
                url: t.url || '',
                score: t.score || 0,
                comments: t.comments || 0,
                source: 'twitter' as const,
                community: t.community || 'X / Twitter',
                author: t.author || null,
                createdAt: t.created_at_ts || 0,
                tickers: t.tickers || [],
                isHot: t.is_hot || false,
                image: t.image || undefined,
            }));
        }
    } catch (err) {
        console.error('[Twitter] Supabase read error:', err);
    }

    // Local fallback for dev
    try {
        const tweetsPath = join(process.cwd(), 'data', 'tweets.json');
        if (!existsSync(tweetsPath)) return [];
        const raw = readFileSync(tweetsPath, 'utf-8');
        const data = JSON.parse(raw);
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
            image: p.image || undefined,
        }));
        console.log(`[Twitter] Loaded ${posts.length} tweets from local JSON`);
        return posts;
    } catch {
        return [];
    }
}

// ─── Public API ───────────────────────────────────────────────────────

export async function getAllPosts(limit?: number): Promise<SocialPost[]> {
    const [newsPosts, redditPosts, twitterPosts] = await Promise.all([
        fetchNewsFeedPosts(),
        fetchRedditPosts(),
        loadTwitterPosts(),
    ]);

    const all = [...newsPosts, ...redditPosts, ...twitterPosts];
    console.log(`[Pulse] ${all.length} total posts (${newsPosts.length} news, ${redditPosts.length} Reddit, ${twitterPosts.length} Twitter)`);

    all.sort((a, b) => b.createdAt - a.createdAt);
    return limit ? all.slice(0, limit) : all;
}

export async function getNewsPosts(): Promise<SocialPost[]> {
    return fetchNewsFeedPosts();
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
