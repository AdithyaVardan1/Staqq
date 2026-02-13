
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GET } from '../app/api/stocks/search/route';
import { NextResponse } from 'next/server';

// Mock Request
class MockRequest {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

async function test() {
    console.log('Testing GET handler...');
    const req = new MockRequest('http://localhost:3000/api/stocks/search?q=TECHM');

    try {
        const res = await GET(req as any);
        console.log('Response status:', res.status);
        if (res.status === 200) {
            const json = await res.json();
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        } else {
            // If status is not 200, check body
            // But NextResponse body might not be readable in this context easily
            console.error('Failed with status:', res.status);
            // Try to see if we can get body
        }
    } catch (e) {
        console.error('Handler execution error:', e);
    }
}

test();
