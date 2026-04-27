import { MetadataRoute } from 'next';
import { getAllIPOs } from '@/lib/ipo';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in';

async function getBlogPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false });
  return data || [];
}

// Realistic last-modified dates for static pages.
// Using new Date() for everything tells Google every page changes on every crawl -- avoid.
const STATIC_ROUTES: { url: string; lastModified: Date; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { url: '',                      lastModified: new Date('2025-01-01'), changeFrequency: 'hourly',  priority: 1.0  },
  { url: '/ipo',                  lastModified: new Date('2025-01-01'), changeFrequency: 'hourly',  priority: 0.95 },
  { url: '/signals',              lastModified: new Date('2025-01-01'), changeFrequency: 'hourly',  priority: 0.85 },
  { url: '/signals/fii-dii',      lastModified: new Date('2025-01-01'), changeFrequency: 'daily',   priority: 0.85 },
  { url: '/signals/insider-trades',lastModified: new Date('2025-01-01'), changeFrequency: 'daily',  priority: 0.80 },
  { url: '/signals/bulk-deals',   lastModified: new Date('2025-01-01'), changeFrequency: 'daily',   priority: 0.75 },
  { url: '/stocks/screener',      lastModified: new Date('2025-01-01'), changeFrequency: 'daily',   priority: 0.75 },
  { url: '/crypto',               lastModified: new Date('2025-01-01'), changeFrequency: 'daily',   priority: 0.65 },
  { url: '/learn',                lastModified: new Date('2025-01-01'), changeFrequency: 'weekly',  priority: 0.55 },
  { url: '/blog',                 lastModified: new Date('2025-01-01'), changeFrequency: 'daily',   priority: 0.65 },
  { url: '/pricing',              lastModified: new Date('2025-01-01'), changeFrequency: 'monthly', priority: 0.45 },
  { url: '/alerts',               lastModified: new Date('2025-01-01'), changeFrequency: 'weekly',  priority: 0.85 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const ipos = await getAllIPOs();
  const ipoRoutes = ipos.map((ipo) => ({
    url: `${BASE_URL}/ipo/${ipo.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.90,
  }));

  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...ipoRoutes, ...blogRoutes];
}
