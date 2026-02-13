
const yahooFinance = require('yahoo-finance2').default;
// Some versions might require direct object access or require('yahoo-finance2').

async function testScreener() {
    try {
        // Try a predefined screener like 'most_actives' and filter for .NS / .BO
        console.log('Fetching most active stocks...');
        const results = await yahooFinance.screener({
            scrIds: 'most_actives',
            count: 50,
            region: 'IN'
        });

        console.log('Total results:', results.quotes.length);
        const indianStocks = results.quotes.filter(q => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'));
        console.log('Indian stocks found:', indianStocks.length);
        console.log('Sample:', JSON.stringify(indianStocks.slice(0, 2), null, 2));

    } catch (error) {
        console.error('Screener Error:', error);
    }
}

testScreener();
