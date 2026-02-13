
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { angelOne } from '../lib/angelone';

async function test() {
    console.log('Successfully imported angelOne service');
    console.log('Instance exists:', !!angelOne);
    try {
        console.log('Testing searchInstruments("TECHM")...');
        const results = await angelOne.searchInstruments('TECHM');
        console.log('Results:', results);
    } catch (e) {
        console.error('Execution error:', e);
    }
}

test();
