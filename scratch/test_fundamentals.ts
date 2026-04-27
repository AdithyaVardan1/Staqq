import { yahoo } from '../src/lib/yahoo.ts';

async function main() {
    try {
        const q = await yahoo.getFundamentals('RELIANCE.NS');
        console.log('Fundamentals:', q ? Object.keys(q) : 'null');
    } catch(e: any) {
        console.log('Error:', e.message);
    }
}
main();
