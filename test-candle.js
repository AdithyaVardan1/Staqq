const { SmartAPI } = require('smartapi-javascript');
const smartApi = new SmartAPI({ api_key: 'test' });
console.log('getCandleData args:', smartApi.getCandleData.toString());

// Mock authenticate and call manually if needed, or just check method sig
const fs = require('fs');
const path = require('path');

// Basic script to try fetching one set of candle data
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.ANGEL_ONE_API_KEY;
const CLIENT_CODE = process.env.ANGEL_ONE_CLIENT_CODE;
const PASSWORD = process.env.ANGEL_ONE_PASSWORD;
const TOTP_SECRET = process.env.ANGEL_ONE_TOTP_SECRET;

const { generateSync } = require('otplib');

async function testCandle() {
    const api = new SmartAPI({ api_key: API_KEY });
    const totp = generateSync({ secret: TOTP_SECRET, algorithm: 'sha1', digits: 6, period: 30 });

    console.log('Authenticating...');
    const session = await api.generateSession(CLIENT_CODE, PASSWORD, totp);
    if (!session.status) {
        console.error('Auth failed:', session.message);
        return;
    }
    console.log('Auth success');

    // Reliance Token: 2885
    // Exchange: NSE
    // Timeframe: 1 Day (ONE_DAY)
    // From/To: last 30 days works for 1M
    const now = new Date();
    const fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Format: YYYY-MM-DD HH:mm
    const formatDate = (d) => d.toISOString().replace('T', ' ').substring(0, 16);

    const params = {
        exchange: 'NSE',
        symboltoken: '2885',
        interval: 'ONE_DAY',
        fromdate: formatDate(fromDate),
        todate: formatDate(now)
    };

    console.log('Fetching candle data:', params);
    try {
        const data = await api.getCandleData(params);
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testCandle();
