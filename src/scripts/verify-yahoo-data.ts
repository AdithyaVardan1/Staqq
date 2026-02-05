
import yahooFinance from 'yahoo-finance2';

async function verifyYahoo() {
    const ticker = 'RELIANCE.NS';
    try {
        console.log(`[Diagnostic] Fetching data for ${ticker}...`);
        const quote = await yahooFinance.quoteSummary(ticker, {
            modules: [
                'summaryDetail',
                'defaultKeyStatistics',
                'financialData',
                'assetProfile',
                'incomeStatementHistory',
                'incomeStatementHistoryQuarterly',
                'balanceSheetHistory',
                'balanceSheetHistoryQuarterly'
            ]
        });

        console.log('[Diagnostic] Keys received:', Object.keys(quote));

        if (quote.summaryDetail) {
            console.log('[Diagnostic] Market Cap:', quote.summaryDetail.marketCap);
            console.log('[Diagnostic] Trailing PE:', quote.summaryDetail.trailingPE);
        } else {
            console.log('[Diagnostic] summaryDetail is MISSING');
        }

        if (quote.financialData) {
            console.log('[Diagnostic] ROE:', quote.financialData.returnOnEquity);
            console.log('[Diagnostic] Net Margin:', quote.financialData.profitMargins);
        } else {
            console.log('[Diagnostic] financialData is MISSING');
        }

        if (quote.incomeStatementHistoryQuarterly) {
            console.log('[Diagnostic] Quarterly Income Statements count:', quote.incomeStatementHistoryQuarterly.incomeStatementHistory?.length);
            if (quote.incomeStatementHistoryQuarterly.incomeStatementHistory?.length > 0) {
                console.log('[Diagnostic] Latest Revenue:', quote.incomeStatementHistoryQuarterly.incomeStatementHistory[0].totalRevenue);
            }
        }

    } catch (error: any) {
        console.error('[Diagnostic] Error:', error.message);
        if (error.result) {
            console.log('[Diagnostic] Partial result received:', Object.keys(error.result));
        }
    }
}

verifyYahoo();
