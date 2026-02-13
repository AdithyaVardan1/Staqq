import {
    fetchMarketSummary,
    fetchIPONews,
    fetchTrendingStocks,
    fetchRegulatoryNews,
    fetchFinancialInsight,
    type TavilySearchResult,
} from './tavily';
import { summarizeSection } from './groqSummarizer';

export interface NewsletterContent {
    issueDate: string;
    bigPictureSummary: string | null;
    marketSummary: TavilySearchResult;
    ipoNews: TavilySearchResult;
    trendingStocks: TavilySearchResult;
    regulatoryNews: TavilySearchResult;
    financialInsight: TavilySearchResult;
}

export async function generateNewsletterContent(): Promise<NewsletterContent> {
    const now = new Date();
    const issueDate = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Fetch all data in parallel for speed
    const [marketSummary, ipoNews, trendingStocks, regulatoryNews, financialInsight] =
        await Promise.all([
            fetchMarketSummary(),
            fetchIPONews(),
            fetchTrendingStocks(),
            fetchRegulatoryNews(),
            fetchFinancialInsight(),
        ]);

    // Generate Big Picture section overview from market articles
    const bigPictureSummary = await summarizeSection(
        marketSummary.articles.map(a => ({ title: a.title, content: a.content }))
    );

    return {
        issueDate,
        bigPictureSummary,
        marketSummary,
        ipoNews,
        trendingStocks,
        regulatoryNews,
        financialInsight,
    };
}
