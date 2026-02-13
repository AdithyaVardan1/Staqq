
const fs = require('fs');
async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const universe = data.filter(item => item.exch_seg === 'NSE' && item.symbol.endsWith('-EQ'))
        .map(item => item.symbol.replace('-EQ', ''))
        .sort((a, b) => a.localeCompare(b));

    const akashIdx = universe.indexOf('AKASH');
    console.log('AKASH index:', akashIdx);
    if (akashIdx !== -1) {
        console.log('Stocks after AKASH:', universe.slice(akashIdx, akashIdx + 20).join(', '));
    }
}
check();
