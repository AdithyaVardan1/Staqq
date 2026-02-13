import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { SmartAPI } from 'smartapi-javascript';
import { generateSync } from 'otplib';

const API_KEY = process.env.ANGEL_ONE_API_KEY;
const CLIENT_CODE = process.env.ANGEL_ONE_CLIENT_CODE;
const PASSWORD = process.env.ANGEL_ONE_PASSWORD;
const TOTP_SECRET = process.env.ANGEL_ONE_TOTP_SECRET;

async function debugFundamental() {
    try {
        const smartApi = new SmartAPI({ api_key: API_KEY });
        const token = generateSync({
            secret: TOTP_SECRET,
            algorithm: 'sha1',
            digits: 6,
            period: 30
        });

        const session = await smartApi.generateSession(CLIENT_CODE, PASSWORD, token);
        if (!session.status) {
            console.error('Auth failed');
            return;
        }

        const jwtToken = session.data.jwtToken;

        console.log('Fetching fundamentals for RELIANCE (2885) on NSE...');
        const response = await axios.post('https://apiconnect.angelbroking.com/rest/auth/angelbroking/market/v1/getFundamental',
            {
                exchange: 'NSE',
                symboltoken: '2885'
            },
            {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                    'X-ClientLocalIP': '192.168.1.1',
                    'X-ClientPublicIP': '1.1.1.1',
                    'X-MACAddress': 'test',
                    'X-PrivateKey': API_KEY
                }
            });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data Type:', typeof response.data);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

debugFundamental();
