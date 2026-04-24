import { NextResponse } from 'next/server';
import { getAllIPOs } from '@/lib/ipo';

export const revalidate = 300;

export async function GET() {
    try {
        const ipos = await getAllIPOs();

        const STATUS_ORDER: Record<string, number> = { Live: 0, Upcoming: 1, Closed: 2, Listed: 3 };

        const simplified = ipos
            .map(ipo => ({
                id: ipo.id,
                slug: ipo.slug,
                name: ipo.name,
                price: ipo.price,
                lotSize: ipo.lotSize,
                gmp: ipo.gmp,
                gmpPercent: ipo.gmpPercent,
                estListing: ipo.estListing,
                subscriptionNum: ipo.subscriptionNum,
                subscription: ipo.subscription,
                status: ipo.status,
                category: ipo.category,
                openDate: ipo.openDate,
                closeDate: ipo.closeDate,
                listingDate: ipo.listingDate,
                ipoSizeCr: ipo.ipoSizeCr,
            }))
            .sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));

        return NextResponse.json({ ipos: simplified });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
