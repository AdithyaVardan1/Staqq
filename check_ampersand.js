
const fs = require('fs');
async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const ampersandStocks = data.filter(item => item.exch_seg === 'NSE' && item.symbol.includes('&'));
    console.log('Stocks with Ampersand:', ampersandStocks.map(i => i.symbol).join(', '));

    const areAndM = data.find(item => item.symbol === 'ARE&M-EQ');
    console.log('ARE&M-EQ:', areAndM);
}
check();
