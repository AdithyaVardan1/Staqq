import { NextResponse } from 'next/server';
import { analyzeToken, type SupportedChain, CHAIN_IDS } from '@/lib/goplus';

export const dynamic = 'force-dynamic';

const VALID_CHAINS = Object.keys(CHAIN_IDS) as SupportedChain[];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')?.trim();
    const chain = (searchParams.get('chain') || 'eth') as SupportedChain;

    if (!address) {
        return NextResponse.json({ error: 'Contract address is required' }, { status: 400 });
    }

    if (!VALID_CHAINS.includes(chain)) {
        return NextResponse.json({ error: `Invalid chain. Use: ${VALID_CHAINS.join(', ')}` }, { status: 400 });
    }

    try {
        const result = await analyzeToken(chain, address);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Rugpull API] Error:', error.message);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
