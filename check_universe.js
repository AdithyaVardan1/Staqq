
const fs = require('fs');
async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const universe = data.filter(item => item.exch_seg === 'NSE' && item.symbol.endsWith('-EQ'))
        .map(item => item.symbol.replace('-EQ', ''))
        .sort((a, b) => a.localeCompare(b));

    const hasARE = universe.includes('ARE');
    console.log('Does universe include ARE?', hasARE);
    if (hasARE) {
        console.log('Index of ARE:', universe.indexOf('ARE'));
    }

    const neighbors = universe.filter(t => t.includes('ARE'));
    console.log('Tickers containing ARE:', neighbors.join(', '));
}
check();
