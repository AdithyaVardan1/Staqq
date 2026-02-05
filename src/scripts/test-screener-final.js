
const axios = require('axios');

async function testScreener() {
    const ticker = 'RELIANCE';
    try {
        console.log(`[Screener] Searching for ${ticker}...`);
        // The search API returns the company ID or URL
        const searchRes = await axios.get(`https://www.screener.in/api/company/search/?q=${ticker}`);
        console.log('[Screener] Search Response:', searchRes.data);

        if (searchRes.data.length > 0) {
            const url = `https://www.screener.in${searchRes.data[0].url}`;
            console.log(`[Screener] Fetching HTML for parsing: ${url}`);

            const pageRes = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Check if we can find the fundamental numbers in the HTML (they are in <li> items with data-property)
            const hasMCap = pageRes.data.includes('Market Cap');
            const hasPE = pageRes.data.includes('Stock P/E');
            console.log(`[Screener] Found Market Cap: ${hasMCap}, Found PE: ${hasPE}`);

            // For Financials, they are in a table with id "quarters" or "profit-loss"
            const hasQuarters = pageRes.data.includes('id="quarters"');
            console.log(`[Screener] Found Quarters Table: ${hasQuarters}`);
        }
    } catch (err) {
        console.error('[Screener] Error:', err.message);
    }
}

testScreener();
