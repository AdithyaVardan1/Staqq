const fs = require('fs');
const path = require('path');

const cachePath = path.join(process.cwd(), 'angelone_tokens.json');
if (!fs.existsSync(cachePath)) {
    console.error('Cache not found');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const tickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC'];

tickers.forEach(t => {
    const symbol = `${t}-EQ`;
    const match = data.find(i => i.symbol === symbol && i.exch_seg === 'NSE');
    if (match) {
        console.log(`${t}: ${match.token} (${match.type})`);
    } else {
        console.log(`${t}: NOT FOUND`);
    }
});
