import { yahoo } from '../src/lib/yahoo';

async function main() {
    console.log('yahoo imported:', typeof yahoo);
    if (yahoo) {
        console.log('Methods:', Object.keys(yahoo));
        try {
            const q = await yahoo.getQuote('RELIANCE.NS');
            console.log('Quote:', q?.regularMarketPrice);
        } catch(e: any) {
            console.log('Error:', e.message);
        }
    }
}
main();
