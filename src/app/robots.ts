import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/auth/', '/profile/', '/admin/', '/login', '/signup', '/dashboard/'],
            },
            // AI crawlers -- explicitly allowed so Perplexity, ChatGPT, Claude can cite us
            { userAgent: 'GPTBot',        allow: '/' },
            { userAgent: 'OAI-SearchBot', allow: '/' },
            { userAgent: 'ChatGPT-User',  allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'ClaudeBot',     allow: '/' },
            { userAgent: 'Applebot',      allow: '/' },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
