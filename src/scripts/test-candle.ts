import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { angelOne } from '../lib/angelone';

async function testCandle() {
    console.log('Authenticating...');
    const auth = await angelOne.authenticate();
    if (!auth?.success) {
        console.error('Auth failed');
        return;
    }
    console.log('Auth success');

    // Reliance: NSE:RELIANCE-EQ -> Token 2885
    // Need to verify findToken functionality too or just use hardcoded
    const token = '2885';

    // Test 1 Day data
    const now = new Date();
    const fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Format: YYYY-MM-DD HH:mm
    const formatDate = (d: Date) => d.toISOString().replace('T', ' ').substring(0, 16);

    const params = {
        exchange: 'NSE',
        symboltoken: token,
        interval: 'ONE_DAY',
        fromdate: formatDate(fromDate),
        todate: formatDate(now)
    };

    console.log('Fetching candle data:', params);
    try {
        // We need to access smartApi instance or add getCandleData to service
        // Since getCandleData is not exposed in service yet, let's use the private instance or add it temporarily
        // But for this script, we can just use the public method if we add it to AngelOneService
        // OR we can't access private property. 
        // Let's add getCandleData to AngelOneService first or use 'any' cast.
        const api = (angelOne as any).smartApi;
        const data = await api.getCandleData(params);
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testCandle();
