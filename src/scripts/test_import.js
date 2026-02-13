
require('dotenv').config({ path: '.env.local' });
const { angelOne } = require('../lib/angelone');

async function test() {
    console.log('Successfully imported angelOne service');
    console.log('Instance:', angelOne);
    try {
        console.log('Testing getInstrumentTokens...');
        // We need to mock fetch or ensure it works in this environment
        // But simply importing it confirms syntax and module resolution.

        // If we want to test execution:
        // await angelOne.getInstrumentTokens();
        // console.log('Tokens fetched');
    } catch (e) {
        console.error('Execution error:', e);
    }
}

test();
