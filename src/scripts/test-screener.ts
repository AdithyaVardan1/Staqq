
import axios from 'axios';

async function testScreener() {
    const tickers = ['RELIANCE', 'TCS', 'HDFCBANK'];

    for (const ticker of tickers) {
        try {
            console.log(`[Screener] Testing search for: ${ticker}`);
            const searchRes = await axios.get(`https://www.screener.in/api/company/search/?q=${ticker}`);
            console.log(`[Screener] Search results:`, JSON.stringify(searchRes.data, null, 2));

            if (searchRes.data.length > 0) {
                const companyUrl = searchRes.data[0].url;
                console.log(`[Screener] Fetching company page: https://www.screener.in${companyUrl}`);

                // Note: The company page needs parsing or has hidden JSON
                const pageRes = await axios.get(`https://www.screener.in${companyUrl}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                console.log(`[Screener] Page status: ${pageRes.status}`);
                // In a real implementation, we would extract data from the HTML tables
                // or look for the data-warehouse script tag.
            }
        } catch (error: any) {
            console.error(`[Screener] Error for ${ticker}:`, error.message);
        }
    }
}

testScreener();
