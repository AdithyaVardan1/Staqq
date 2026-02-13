
const fs = require('fs');
async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const exactSymbol = data.filter(item => item.symbol === 'ARE' || item.symbol === 'ARE-EQ');
    console.log('Exact Matches:', JSON.stringify(exactSymbol, null, 2));

    const containsARE = data.filter(item => item.symbol && item.symbol.includes('ARE') && item.exch_seg === 'NSE');
    console.log('Contains ARE (NSE):', containsARE.map(i => i.symbol).join(', '));
}
check();
