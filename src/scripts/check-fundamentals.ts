
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { angelOne } from '../lib/angelone';

async function checkFundamentals() {
    try {
        console.log('Authenticating...');
        const auth = await angelOne.authenticate();
        if (!auth?.success) {
            console.error('Auth failed:', auth?.error);
            return;
        }

        console.log('Fetching Full Quote for RELIANCE (NSE: 2885)...');
        // RELIANCE token is usually 2885 on NSE
        // We can look it up to be sure, but hardcoding for test is fine if we know it.
        // Or verify via findToken
        const token = await angelOne.findToken('RELIANCE', 'NSE');
        console.log('Token:', token);

        if (!token) {
            console.error('Token not found');
            return;
        }

        // Get Full Quote
        const quote = await angelOne.getFullQuote('NSE', 'RELIANCE', token);
        console.log('Full Quote Response:', JSON.stringify(quote, null, 2));

        // Also check getLTP to see if it differs
        const ltp = await angelOne.getLTP('NSE', 'RELIANCE-EQ', token); // -EQ might be needed for tradingsymbol in getLTP
        console.log('LTP Response:', JSON.stringify(ltp, null, 2));

    } catch (error) {
        console.error('Script Error:', error);
    }
}

checkFundamentals();
