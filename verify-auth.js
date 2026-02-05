const { SmartAPI } = require('smartapi-javascript');
const fs = require('fs');
const path = require('path');

// Basic .env.local loader
const envPath = path.join(process.cwd(), '.env.local');
let envContent;
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('❌ Could not read .env.local file');
    process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        const val = value.split('#')[0].trim();
        env[key.trim()] = val;
    }
});

const API_KEY = env.ANGEL_ONE_API_KEY;
const CLIENT_CODE = env.ANGEL_ONE_CLIENT_CODE;
const PASSWORD = env.ANGEL_ONE_PASSWORD;
const TOTP_SECRET = env.ANGEL_ONE_TOTP_SECRET;

async function testAuth() {
    console.log('--- Angel One Auth Test ---');

    // Dynamic import for ESM otplib
    const { generateSync } = await import('otplib');

    let token = generateSync({
        secret: TOTP_SECRET,
        algorithm: 'sha1',
        digits: 6,
        period: 30
    });
    console.log('Generated TOTP:', token);

    const smartApi = new SmartAPI({ api_key: API_KEY });

    try {
        const response = await smartApi.generateSession(CLIENT_CODE, PASSWORD, token);

        if (response.status) {
            console.log('✅ SUCCESS: Session generated!');
        } else {
            console.log('❌ FAILED:', response.message);
            if (response.errorcode) console.log('Code:', response.errorcode);
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

testAuth();
