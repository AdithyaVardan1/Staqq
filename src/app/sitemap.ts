import type { MetadataRoute } from 'next';
import { getAllIPOs } from '@/lib/ipo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.com';

    const allIPOs = await getAllIPOs();

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/ipo`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
        { url: `${baseUrl}/ipo/analytics`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/ipo/allotment-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/signals`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
        { url: `${baseUrl}/signals/fii-dii`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/signals/insider-trades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/signals/bulk-deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/stocks/screener`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ];

    const ipoPages: MetadataRoute.Sitemap = allIPOs.map((ipo) => ({
        url: `${baseUrl}/ipo/${ipo.slug}`,
        lastModified: new Date(),
        changeFrequency: ipo.status === 'Live' ? 'hourly' as const : 'daily' as const,
        priority: ipo.status === 'Live' ? 0.8 : 0.5,
    }));

    return [...staticPages, ...ipoPages];
}
