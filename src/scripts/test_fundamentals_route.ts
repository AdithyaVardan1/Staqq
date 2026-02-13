
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GET } from '../app/api/stocks/fundamentals/route';
import { NextResponse } from 'next/server';

// Mock Request
class MockRequest {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

async function test() {
    console.log('Testing GET fundamentals handler for RELIANCE...');
    const req = new MockRequest('http://localhost:3000/api/stocks/fundamentals?ticker=RELIANCE');

    try {
        const res = await GET(req as any);
        console.log('Response status:', res.status);
        if (res.status === 200) {
            const json = await res.json();
            console.log('Fundamentals Source:', json.source);
            console.log('Shareholding:', JSON.stringify(json.fundamentals.shareholding, null, 2));

            if (json.fundamentals.shareholding && json.fundamentals.shareholding.length > 0) {
                console.log('SUCCESS: Shareholding data found.');
            } else {
                console.error('FAILURE: Shareholding data missing.');
            }
        } else {
            console.error('Failed with status:', res.status);
        }
    } catch (e) {
        console.error('Handler execution error:', e);
    }
}

test();
