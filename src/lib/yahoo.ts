// Remove the static import since we'll use dynamic import
// import yahooFinance from 'yahoo-finance2';

export interface FundamentalData {
    ticker: string;
    description: string;
    sector: string;
    industry: string;
    marketCap: number;
    peRatio: number;
    pegRatio: number;
    pbRatio: number;
    beta: number;
    divYield: number;
    netMargin: number;
    roe: number;
    roa: number;
    eps: number;
    high52: number;
    low52: number;
    debtToEquity: number;
    website: string;
    financials: {
        quarterly: {
            period: string;
            revenue: number;
            profit: number;
            networth: number;
            eps: number;
        }[];
        annual: {
            year: string;
            revenue: number;
            profit: number;
            networth: number;
            eps: number;
        }[];
    };
}

export class YahooFinanceService {
    private static instance: YahooFinanceService;

    private constructor() {
        // Dynamic import will be used in getFundamentals method
    }

    public static getInstance(): YahooFinanceService {
        if (!YahooFinanceService.instance) {
            YahooFinanceService.instance = new YahooFinanceService();
        }
        return YahooFinanceService.instance;
    }

    public async getFundamentals(ticker: string): Promise<FundamentalData | null> {
        try {
            console.log(`[Yahoo] Starting fetch for ticker: ${ticker}`);

            // Append .NS if missing (assuming NSE)
            const symbol = ticker.endsWith('.NS') || ticker.endsWith('.BO') ? ticker : `${ticker}.NS`;
            console.log(`[Yahoo] Using symbol: ${symbol}`);

            // Import yahoo-finance2 dynamically to avoid potential SSR issues
            const yahooFinance = (await import('yahoo-finance2')).default;

            console.log(`[Yahoo] Calling quoteSummary for: ${symbol}`);
            const quote: any = await yahooFinance.quoteSummary(symbol, {
                modules: [
                    'summaryDetail', // Market Cap, Beta, Div Yield, 52W High/Low
                    'defaultKeyStatistics', // P/E, PEG, P/B, Margins
                    'financialData', // ROE, ROA, Debt/Equity, Revenue, Target Price
                    'assetProfile', // Description, Sector, Industry, Website
                    'incomeStatementHistory',
                    'incomeStatementHistoryQuarterly',
                    'balanceSheetHistory',
                    'balanceSheetHistoryQuarterly',
                ]
            });

            console.log(`[Yahoo] Quote received for ${symbol}:`, Object.keys(quote));

            const summary = quote.summaryDetail;
            const stats = quote.defaultKeyStatistics;
            const financials = quote.financialData;
            const profile = quote.assetProfile;

            const result = {
                ticker: symbol,
                description: profile?.longBusinessSummary || '',
                sector: profile?.sector || 'Unknown',
                industry: profile?.industry || 'Unknown',
                website: profile?.website || '',

                // Valuation
                marketCap: summary?.marketCap || 0,
                peRatio: summary?.trailingPE || stats?.forwardPE || 0,
                pegRatio: stats?.pegRatio || 0,
                pbRatio: stats?.priceToBook || 0,

                // Stats
                beta: summary?.beta || 0,
                divYield: summary?.dividendYield || 0,
                high52: summary?.fiftyTwoWeekHigh || 0,
                low52: summary?.fiftyTwoWeekLow || 0,

                // Profitability
                netMargin: financials?.profitMargins || 0,
                roe: financials?.returnOnEquity || 0,
                roa: financials?.returnOnAssets || 0,
                eps: stats?.trailingEps || 0,

                // Leverage
                debtToEquity: financials?.debtToEquity || 0,

                financials: {
                    quarterly: (quote.incomeStatementHistoryQuarterly?.incomeStatementHistory || []).map((item: any, idx: number) => {
                        const bs = quote.balanceSheetHistoryQuarterly?.balanceSheetStatements?.[idx];
                        return {
                            period: new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                            revenue: item.totalRevenue || 0,
                            profit: item.netIncome || 0,
                            networth: (bs?.totalAssets || 0) - (bs?.totalLiab || 0),
                            eps: item.dilutedEps || 0
                        };
                    }).reverse(),
                    annual: (quote.incomeStatementHistory?.incomeStatementHistory || []).map((item: any, idx: number) => {
                        const bs = quote.balanceSheetHistory?.balanceSheetStatements?.[idx];
                        return {
                            year: `FY ${new Date(item.endDate).getFullYear()}`,
                            revenue: item.totalRevenue || 0,
                            profit: item.netIncome || 0,
                            networth: (bs?.totalAssets || 0) - (bs?.totalLiab || 0),
                            eps: item.dilutedEps || 0
                        };
                    }).reverse()
                }
            };

            console.log(`[Yahoo] Successfully processed data for ${symbol}`);
            return result;

        } catch (error: any) {
            console.error(`[Yahoo] Error fetching fundamentals for ${ticker}:`, {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return null;
        }
    }
}

export const yahoo = YahooFinanceService.getInstance();
