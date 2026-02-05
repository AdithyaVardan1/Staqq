
import { NextResponse } from 'next/server';
import { yahoo } from '@/lib/yahoo';
import { getMockFundamentals } from '@/lib/mockFallback';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ticker = searchParams.get('ticker');

        console.log(`[Fundamentals API] Request for ticker: ${ticker}`);

        if (!ticker) {
            console.log('[Fundamentals API] No ticker provided');
            return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
        }

        console.log(`[Fundamentals API] Fetching data for: ${ticker}`);
        const data = await yahoo.getFundamentals(ticker);

        if (data) {
            console.log(`[Fundamentals API] Successfully fetched Yahoo Finance data for: ${ticker}`);
            return NextResponse.json({ 
                fundamentals: data,
                source: 'yahoo-finance'
            });
        } else {
            console.log(`[Fundamentals API] Yahoo Finance failed, using mock data for: ${ticker}`);
            const mockData = getMockFundamentals(ticker);
            return NextResponse.json({ 
                fundamentals: mockData,
                source: 'mock-fallback',
                warning: 'Yahoo Finance data unavailable, showing sample data'
            });
        }
        
    } catch (error: any) {
        console.error('[Fundamentals API] Error:', error);
        
        // Fallback to mock data on error
        const ticker = new URL(request.url).searchParams.get('ticker') || 'RELIANCE';
        const mockData = getMockFundamentals(ticker);
        
        return NextResponse.json({ 
            fundamentals: mockData,
            source: 'mock-fallback',
            error: 'Yahoo Finance service error',
            warning: 'Showing sample data due to service unavailability'
        });
    }
}
