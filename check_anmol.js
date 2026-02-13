
const fs = require('fs');
async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const universe = data.filter(item => item.exch_seg === 'NSE' && item.symbol.endsWith('-EQ'))
        .map(item => item.symbol.replace('-EQ', ''))
        .sort((a, b) => a.localeCompare(b));

    console.log('ANMOL included?', universe.includes('ANMOL'));
    console.log('ARE included?', universe.includes('ARE'));

    const idx = universe.indexOf('ANMOL');
    if (idx !== -1) {
        console.log('Neighbors of ANMOL:', universe.slice(Math.max(0, idx - 5), idx + 5).join(', '));
    }
}
check();
