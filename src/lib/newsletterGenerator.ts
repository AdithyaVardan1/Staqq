import {
    fetchMarketSummary,
    fetchIPONews,
    fetchTrendingStocks,
    fetchRegulatoryNews,
    fetchFinancialInsight,
    type TavilySearchResult,
} from './tavily';
import { summarizeSection, summarizeArticle } from './groqSummarizer';

export interface NewsletterContent {
    issueDate: string;
    bigPictureSummary: string | null;
    marketSummary: TavilySearchResult;
    ipoNews: TavilySearchResult;
    trendingStocks: TavilySearchResult;
    regulatoryNews: TavilySearchResult;
    financialInsight: TavilySearchResult;
}

/**
 * Replaces each article's content with a one-line AI summary.
 * Falls back to original content if summarization fails.
 */
async function summarizeArticles(result: TavilySearchResult): Promise<TavilySearchResult> {
    const summarized = await Promise.all(
        result.articles.map(async (article) => {
            const summary = await summarizeArticle(article.title, article.content, true);
            return { ...article, content: summary || article.content };
        })
    );
    return { ...result, articles: summarized };
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
    const [marketSummary, ipoNewsRaw, trendingStocks, regulatoryNewsRaw, financialInsight] =
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

    // Generate one-line AI summaries for IPO Alerts and Quick Hits
    const [ipoNews, regulatoryNews] = await Promise.all([
        summarizeArticles(ipoNewsRaw),
        summarizeArticles(regulatoryNewsRaw),
    ]);

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
