import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { SmartAPI } = require('smartapi-javascript');
import { totp } from 'otplib';
import fs from 'fs';
import path from 'path';

// Basic .env.local loader
const envPath = path.join(process.cwd(), '.env.local');
let envContent;
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('❌ Could not read .env.local file at', envPath);
    process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const API_KEY = env.ANGEL_ONE_API_KEY;
const CLIENT_CODE = env.ANGEL_ONE_CLIENT_CODE;
const PASSWORD = env.ANGEL_ONE_PASSWORD;
const TOTP_SECRET = env.ANGEL_ONE_TOTP_SECRET;

async function testAuth() {
    console.log('--- Angel One Auth Test ---');
    console.log('Client Code:', CLIENT_CODE);

    if (!API_KEY || !CLIENT_CODE || !PASSWORD || !TOTP_SECRET) {
        console.error('❌ Missing credentials in .env.local');
        console.log('Available keys:', Object.keys(env));
        return;
    }

    const smartApi = new SmartAPI({
        api_key: API_KEY,
    });

    try {
        const token = totp.generate(TOTP_SECRET);
        console.log('Generated TOTP:', token);

        const response = await smartApi.generateSession(CLIENT_CODE, PASSWORD, token);

        if (response.status) {
            console.log('✅ Authentication Successful!');
            console.log('JWT Token received:', response.data.jwtToken ? 'Yes' : 'No');
            console.log('Feed Token received:', response.data.feedToken ? 'Yes' : 'No');

            // Test fetching a simple LTP (Reliance)
            console.log('\nTesting LTP fetch for RELIANCE (Token: 2885)...');
            const ltp = await smartApi.getLTPDetail({
                exchange: "NSE",
                tradingsymbol: "RELIANCE-EQ",
                symboltoken: "2885"
            });

            if (ltp.status) {
                console.log('✅ LTP Fetch Successful!');
                console.log('Current Price:', ltp.data.ltp);
            } else {
                console.log('❌ LTP Fetch Failed:', ltp.message);
            }
        } else {
            console.log('❌ Authentication Failed:', response.message);
        }
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

testAuth();
