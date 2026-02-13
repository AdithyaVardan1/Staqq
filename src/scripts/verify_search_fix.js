
// Native fetch is available in Node 18+

async function verifySearch() {
    const query = 'TECHM';
    try {
        console.log(`Verifying search results for: ${query}`);
        const res = await fetch(`http://localhost:3000/api/stocks/search?q=${query}`);
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Response Body:', text);
            return;
        }
        const data = await res.json();

        console.log('Results count:', data.length);
        const keys = data.map((item, index) => `${item.exchange}:${item.symbol}:${index}`); // Simulation of key generation in UI
        console.log('Generated keys (UI simulation):', keys);

        // Check for duplicates in data itself (symbol + exchange)
        const uniqueKeys = new Set();
        const duplicates = [];
        data.forEach(item => {
            const key = `${item.exchange}:${item.symbol}`;
            if (uniqueKeys.has(key)) {
                duplicates.push(key);
            } else {
                uniqueKeys.add(key);
            }
        });

        if (duplicates.length > 0) {
            console.error('DUPLICATE SYMBOL+EXCHANGE FOUND IN API RESPONSE:', duplicates);
        } else {
            console.log('No duplicate symbol+exchange found in API response.');
        }

    } catch (error) {
        console.error('Error verifying search results:', error);
    }
}

verifySearch();
