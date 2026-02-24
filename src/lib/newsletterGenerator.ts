import {
    fetchMarketSummary,
    fetchIPONews,
    fetchTrendingStocks,
    fetchRegulatoryNews,
    fetchFinancialInsight,
    type TavilySearchResult,
} from './tavily';
import {
    summarizeSection,
    summarizeArticle,
    extractMarketAlert,
    extractNumberOfWeek,
    generateIPOVerdict,
    extractConceptOfWeek,
    type MarketAlert,
    type NumberOfWeek,
    type IPOSpotlight,
    type ConceptOfWeek,
} from './groqSummarizer';
import { getAllIPOs, type IPOData } from './ipo';

export type { MarketAlert, NumberOfWeek, IPOSpotlight, ConceptOfWeek };

export interface NewsletterContent {
    issueDate: string;
    // Big picture opener
    bigPictureSummary: string | null;
    // Raw Tavily results (for use in template iteration)
    marketSummary: TavilySearchResult;
    ipoNews: TavilySearchResult;
    trendingStocks: TavilySearchResult;
    regulatoryNews: TavilySearchResult;
    financialInsight: TavilySearchResult;
    // Structured extracted data for newsletter sections
    marketAlert: MarketAlert;
    numberOfWeek: NumberOfWeek;
    ipoSpotlight: IPOSpotlight;
    conceptOfWeek: ConceptOfWeek;
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

/**
 * Pick the best IPO to spotlight: only Live IPOs, sorted by rating then gmpPercent.
 */
function pickBestIPO(ipos: IPOData[]): IPOData | null {
    if (ipos.length === 0) return null;

    const live = ipos
        .filter(i => i.status === 'Live')
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return (b.gmpPercent ?? -999) - (a.gmpPercent ?? -999);
        });

    return live[0] || null;
}

/** Format an IPOData into the IPOSpotlight shape. */
async function buildIPOSpotlight(ipo: IPOData): Promise<IPOSpotlight> {
    const price = ipo.price != null ? `₹${ipo.price}` : '—';
    const gmp = ipo.gmp != null
        ? `${ipo.gmp >= 0 ? '+' : ''}₹${ipo.gmp}`
        : '—';
    const estimated = ipo.estListing != null ? `₹${ipo.estListing}` : '—';
    const closeDate = ipo.closeDate || 'TBA';
    const category = ipo.category === 'SME' ? 'SME' : 'Mainboard';

    // Let Groq generate a verdict based on actual data
    const ipoSummary = [
        `Price: ${price}`,
        `GMP: ${gmp} (${ipo.gmpPercent != null ? ipo.gmpPercent + '%' : 'unknown'})`,
        `Est. Listing: ${estimated}`,
        `Subscription: ${ipo.subscription || 'not yet open'}`,
        `Rating: ${ipo.rating} / 5`,
        `Status: ${ipo.status}`,
        `Close: ${closeDate}`,
    ].join(', ');

    const { verdict, note, description } = await generateIPOVerdict(ipo.name, ipoSummary);

    return {
        name: ipo.name,
        category,
        price,
        gmp,
        estimated,
        closeDate,
        verdict,
        note,
        description,
    };
}

export async function generateNewsletterContent(): Promise<NewsletterContent> {
    const now = new Date();
    const issueDate = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    console.log('[Newsletter] Fetching all data from Tavily + InvestorGain...');

    // Fetch Tavily sections + real IPO list in parallel
    const [marketSummaryRaw, ipoNewsRaw, trendingStocksRaw, regulatoryNewsRaw, financialInsight, allIPOs] =
        await Promise.all([
            fetchMarketSummary(),
            fetchIPONews(),
            fetchTrendingStocks(),
            fetchRegulatoryNews(),
            fetchFinancialInsight(),
            getAllIPOs(),
        ]);

    console.log('[Newsletter] Tavily + IPO feed done. Running Groq summarization...');

    // Generate Big Picture section overview from market articles
    const bigPictureSummary = await summarizeSection(
        marketSummaryRaw.articles.map(a => ({ title: a.title, content: a.content }))
    );

    // Summarize article lists for iteration
    const [ipoNews, regulatoryNews, trendingStocks, marketSummary] = await Promise.all([
        summarizeArticles(ipoNewsRaw),
        summarizeArticles(regulatoryNewsRaw),
        summarizeArticles(trendingStocksRaw),
        summarizeArticles(marketSummaryRaw),
    ]);

    console.log('[Newsletter] Extracting structured sections...');

    const allArticles = [
        ...marketSummaryRaw.articles,
        ...regulatoryNewsRaw.articles,
        ...trendingStocksRaw.articles,
    ];

    // Pick best IPO from the live feed (upcoming first, then live)
    const bestIPO = pickBestIPO(allIPOs);
    const ipoSpotlightFallback: IPOSpotlight = {
        name: 'No IPO this week',
        category: 'Mainboard',
        price: '—',
        gmp: '—',
        estimated: '—',
        closeDate: '—',
        verdict: 'Neutral',
        note: 'No live IPOs right now.',
        description: 'No active IPO available this week.',
    };

    // Run structured extractors in parallel
    const [marketAlert, numberOfWeek, ipoSpotlight, conceptOfWeek] = await Promise.all([
        extractMarketAlert([...regulatoryNewsRaw.articles, ...marketSummaryRaw.articles]),
        extractNumberOfWeek(allArticles),
        bestIPO ? buildIPOSpotlight(bestIPO) : Promise.resolve(ipoSpotlightFallback),
        extractConceptOfWeek(allArticles),
    ]);

    console.log('[Newsletter] All data ready.');

    return {
        issueDate,
        bigPictureSummary,
        marketSummary,
        ipoNews,
        trendingStocks,
        regulatoryNews,
        financialInsight,
        marketAlert,
        numberOfWeek,
        ipoSpotlight,
        conceptOfWeek,
    };
}
