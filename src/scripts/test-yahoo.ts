
import yahooFinance from 'yahoo-finance2';

async function testYahoo() {
    try {
        console.log('Fetching fundamentals for RELIANCE.NS...');
        const quote = await yahooFinance.quoteSummary('RELIANCE.NS', {
            modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData']
        });

        console.log('Result:', JSON.stringify(quote, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testYahoo();
