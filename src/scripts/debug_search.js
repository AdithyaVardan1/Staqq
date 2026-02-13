
async function debugSearch() {
    const query = 'TECHM';
    try {
        console.log(`Checking search results for: ${query}`);
        const res = await fetch(`http://localhost:3000/api/stocks/search?q=${query}`);
        const data = await res.json();

        console.log('Results count:', data.length);
        const keys = data.map(item => `${item.exchange}:${item.symbol}`);
        console.log('Generated keys:', keys);

        const counts = {};
        keys.forEach(k => counts[k] = (counts[k] || 0) + 1);

        const duplicates = Object.keys(counts).filter(k => counts[k] > 1);
        if (duplicates.length > 0) {
            console.error('DUPLICATE KEYS FOUND:', duplicates);
            console.log('Duplicates detail:', data.filter(item => duplicateKeys.includes(`${item.exchange}:${item.symbol}`)));
        } else {
            console.log('No duplicates found in API response.');
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

debugSearch();
