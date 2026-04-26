import { MetadataRoute } from 'next';
import { getAllIPOs } from '@/lib/ipo';

// For blog posts, we'll fetch from Supabase
import { createClient } from '@supabase/supabase-js';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://staqqin.vercel.app';

  // Static routes
  const staticRoutes = [
    { url: '', priority: 1.0, changefreq: 'hourly' },
    { url: '/ipo', priority: 0.95, changefreq: 'hourly' },
    { url: '/stocks/screener', priority: 0.7, changefreq: 'daily' },
    { url: '/crypto', priority: 0.6, changefreq: 'daily' },
    { url: '/signals', priority: 0.8, changefreq: 'daily' },
    { url: '/signals/fii-dii', priority: 0.8, changefreq: 'daily' },
    { url: '/signals/insider-trades', priority: 0.8, changefreq: 'daily' },
    { url: '/learn', priority: 0.5, changefreq: 'weekly' },
    { url: '/blog', priority: 0.6, changefreq: 'daily' },
    { url: '/pricing', priority: 0.4, changefreq: 'monthly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq as any,
    priority: route.priority,
  }));

  // Dynamic IPO routes
  const ipos = await getAllIPOs();
  const ipoRoutes = ipos.map((ipo) => ({
    url: `${baseUrl}/ipo/${ipo.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  // Dynamic Blog routes
  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...ipoRoutes, ...blogRoutes];
}
