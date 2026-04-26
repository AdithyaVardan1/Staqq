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
    { url: 'https://www.livemint.com/rss/markets',                            label: 'LiveMint' },
    { url: 'https://www.thehindubusinessline.com/markets/feeder/default.rss', label: 'BusinessLine' },
];


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

            // News headlines don't use ticker symbols — extracting uppercase words
            // produces garbage like $PREVIEW, $WEATHER, $SELLERS. Skip tickers for news.
            const tickers: string[] = [];

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

// ─── Reddit (Supabase-backed) ─────────────────────────────────────────
// fetch_reddit.py (GitHub Actions cron) fetches from Reddit and writes
// to the `tweets` table. We read from there -- Reddit blocks Vercel IPs.

async function loadRedditPostsFromSupabase(): Promise<SocialPost[]> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('tweets')
            .select('*')
            .eq('source', 'reddit')
            .gte('created_at_ts', Math.floor(Date.now() / 1000) - 86400)
            .order('created_at_ts', { ascending: false })
            .limit(150);

        if (!error && data && data.length > 0) {
            console.log(`[Reddit] Loaded ${data.length} posts from Supabase`);
            return data.map((t: any) => ({
                id: t.post_id,
                title: t.title || '',
                body: t.body || '',
                url: t.url || '',
                score: t.score || 0,
                comments: t.comments || 0,
                source: 'reddit' as const,
                community: t.community || '',
                author: t.author || null,
                createdAt: t.created_at_ts || 0,
                tickers: t.tickers || [],
                isHot: t.is_hot || false,
                image: t.image || undefined,
            }));
        }
        console.log('[Reddit] No posts in Supabase yet');
    } catch (err) {
        console.error('[Reddit] Supabase read error:', err);
    }
    return [];
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
    const [newsPosts, redditPosts] = await Promise.all([
        fetchNewsFeedPosts(),
        loadRedditPostsFromSupabase(),
    ]);

    // Sort each source by recency independently, then cap per-source so no
    // single source monopolises the feed when its content is newer.
    const newsLimit  = Math.ceil((limit || 60) * 0.4);  // 40% news
    const redditLimit = Math.ceil((limit || 60) * 0.6); // 60% Reddit (more social/discusssion)

    const news   = [...newsPosts].sort((a, b) => b.createdAt - a.createdAt).slice(0, newsLimit);
    const reddit = [...redditPosts].sort((a, b) => b.createdAt - a.createdAt).slice(0, redditLimit);

    const all = [...news, ...reddit];
    console.log(`[Pulse] ${all.length} posts (${news.length} news, ${reddit.length} Reddit)`);

    all.sort((a, b) => b.createdAt - a.createdAt);
    return all;
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
