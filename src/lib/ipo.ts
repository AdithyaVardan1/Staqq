// ─── IPO Data Layer ──────────────────────────────────────────────────
// Fetches live IPO GMP data from InvestorGain and returns typed objects.
// Used by server components with Next.js revalidation for auto-refresh.
// ─────────────────────────────────────────────────────────────────────

export interface IPOData {
    id: number;
    slug: string;
    name: string;
    price: number | null;
    gmp: number | null;
    gmpPercent: number | null;
    estListing: number | null;
    subscription: string | null;  // e.g. "4.5x" or null
    subscriptionNum: number | null;
    ipoSizeCr: string | null;
    lotSize: number | null;
    peRatio: string | null;
    openDate: string | null;
    closeDate: string | null;
    listingDate: string | null;
    boaDate: string | null;
    updatedOn: string | null;
    rating: number;  // number of fire emojis (0-5)
    category: 'IPO' | 'SME';
    status: 'Live' | 'Upcoming' | 'Listed' | 'Closed';
    sortOpenDate: string | null;   // ISO date for sorting
    sortCloseDate: string | null;
    sortListingDate: string | null;
    detailUrl: string | null;
    hasAnchor: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined): string | null {
    if (!html || html === '-' || html === '--' || html === '') return null;
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, (m) => {
        const map: Record<string, string> = { '&#8377;': '₹', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#128293;': '🔥' };
        return map[m] || '';
    }).trim();
}

function cleanDate(raw: string | null | undefined): string | null {
    const text = stripHtml(raw);
    if (!text) return null;
    // Strip 'GMP: <value>' artifacts from date strings like '9-Feb GMP: 8'
    return text.replace(/\s*GMP:\s*[-\d.]+/gi, '').trim() || null;
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parseGmp(gmpHtml: string | null | undefined): { amount: number | null; percent: number | null } {
    if (!gmpHtml) return { amount: null, percent: null };
    const text = stripHtml(gmpHtml) || '';
    // Match '₹20 (5.18%)' or '₹-23 (-2.56%)' or '₹-- (0.00%)'
    const amtMatch = text.match(/[₹]?\s*([-\d.]+)/);
    const pctMatch = text.match(/\(([-\d.]+)%\)/);
    const amount = amtMatch ? parseFloat(amtMatch[1]) : null;
    const percent = pctMatch ? parseFloat(pctMatch[1]) : null;
    return {
        amount: (amount !== null && !isNaN(amount)) ? amount : null,
        percent: (percent !== null && !isNaN(percent)) ? percent : null,
    };
}

function parseName(nameHtml: string | null | undefined): string {
    if (!nameHtml) return 'Unknown';
    // Extract text from anchor tag
    const anchorMatch = nameHtml.match(/title="([^"]+)"/);
    if (anchorMatch) return anchorMatch[1].replace(/\s+IPO$/i, '').trim();
    // Fallback: strip all HTML
    const stripped = stripHtml(nameHtml) || 'Unknown';
    return stripped.replace(/\s+[A-Z]$/, '').trim();
}

function parseRating(ratingHtml: string | null | undefined): number {
    if (!ratingHtml) return 0;
    return (ratingHtml.match(/🔥|&#128293;/g) || []).length;
}

function parseSubscription(subRaw: string | null | undefined): { display: string | null; num: number | null } {
    if (!subRaw || subRaw === '-' || subRaw === '--') return { display: null, num: null };
    const text = stripHtml(subRaw);
    if (!text) return { display: null, num: null };
    const numMatch = text.match(/([\d.]+)x/);
    return {
        display: text,
        num: numMatch ? parseFloat(numMatch[1]) : null,
    };
}

function determineStatus(sortOpen: string | null, sortClose: string | null, sortListing: string | null): 'Live' | 'Upcoming' | 'Listed' | 'Closed' {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (sortListing && sortListing <= today) return 'Listed';
    if (sortOpen && sortClose) {
        if (today >= sortOpen && today <= sortClose) return 'Live';
        if (today < sortOpen) return 'Upcoming';
        if (today > sortClose) return 'Closed';
    }
    if (sortOpen && today < sortOpen) return 'Upcoming';
    if (sortOpen && !sortClose && today >= sortOpen) return 'Live';

    return 'Upcoming'; // default for IPOs with no dates
}

function determineCategory(raw: Record<string, unknown>): 'IPO' | 'SME' {
    const cat = raw['~IPO_Category'] as string | undefined;
    if (cat === 'SME') return 'SME';
    const name = (raw['~ipo_name'] as string) || '';
    if (/SME/i.test(name) || /BSE SME|NSE SME/i.test(name)) return 'SME';
    return 'IPO';
}

// ─── Cookies & Headers ──────────────────────────────────────────────

const COOKIES = 'user=%7B%22msg%22%3A1%2C%22id%22%3A631%2C%22name%22%3A%22Gambler%22%2C%22display_name%22%3A%22gambler%22%2C%22email%22%3A%22gamblerhustlerav%40gmail.com%22%2C%22role_id%22%3A1%2C%22login_cnt%22%3A1%2C%22accessToken%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMxLCJyb2xlX2lkIjoxLCJ0ZW1wX3Rva2VuIjpmYWxzZSwiaWF0IjoxNzcwOTgzMjkzLCJleHAiOjE3NzM1NzUyOTN9.iGDHb_xFT5UoJB6orv2BtoaoVIYRzSm2vf63YNraYVE%22%2C%22tokenExpireTime%22%3A2592000000%2C%22timer%22%3A120%2C%22temp_token%22%3Afalse%7D; flashcard=1; fontSize=font-default; reportTableScrolable=true';

const HEADERS: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://www.investorgain.com/report/live-ipo-gmp/331/',
    'Accept': 'application/json, text/plain, */*',
    'Cookie': COOKIES,
};

// ─── Fetch ───────────────────────────────────────────────────────────

async function fetchRawIPOs(): Promise<Record<string, unknown>[]> {
    const allRecords: Record<string, unknown>[] = [];
    let page = 1;

    while (true) {
        const url = `https://webnodejs.investorgain.com/cloud/new/report/data-read/331/1/2/2026/2025-26/0/all?search=&v=${page}-${page + 1}`;

        const res = await fetch(url, {
            headers: HEADERS,
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!res.ok) {
            console.error(`[IPO] Failed to fetch page ${page}: ${res.status}`);
            break;
        }

        const data = await res.json();
        const records = (data.reportTableData || []) as Record<string, unknown>[];
        const totalPages = (data.totalPages || 1) as number;

        allRecords.push(...records);

        if (page >= totalPages || records.length === 0) break;
        page++;
    }

    return allRecords;
}

function parseRecord(raw: Record<string, unknown>): IPOData {
    const { amount: gmp, percent: gmpPercent } = parseGmp(raw['GMP'] as string);
    const priceStr = stripHtml(raw['Price (₹)'] as string);
    const price = priceStr ? parseFloat(priceStr.replace(/[^\d.]/g, '')) : null;
    const estListing = (price !== null && gmp !== null) ? Math.round((price + gmp) * 100) / 100 : null;
    const { display: subscription, num: subscriptionNum } = parseSubscription(raw['Sub'] as string);
    const lotStr = stripHtml(raw['Lot'] as string);
    const name = parseName(raw['Name'] as string);

    const sortOpen = (raw['~Srt_Open'] as string) || null;
    const sortClose = (raw['~Srt_Close'] as string) || null;
    const sortListing = (raw['~Str_Listing'] as string) || null;

    return {
        id: (raw['~id'] as number) || 0,
        slug: slugify(name),
        name,
        price,
        gmp,
        gmpPercent,
        estListing,
        subscription,
        subscriptionNum,
        ipoSizeCr: stripHtml(raw['IPO Size (₹ in cr)'] as string),
        lotSize: lotStr ? parseInt(lotStr, 10) : null,
        peRatio: stripHtml(raw['~P/E'] as string),
        openDate: cleanDate(raw['Open'] as string),
        closeDate: cleanDate(raw['Close'] as string),
        listingDate: cleanDate(raw['Listing'] as string),
        boaDate: cleanDate(raw['BoA Dt'] as string),
        updatedOn: stripHtml(raw['Updated-On'] as string),
        rating: parseRating(raw['Rating'] as string),
        category: determineCategory(raw),
        status: determineStatus(sortOpen, sortClose, sortListing),
        sortOpenDate: sortOpen,
        sortCloseDate: sortClose,
        sortListingDate: sortListing,
        detailUrl: (raw['~urlrewrite_folder_name'] as string) || null,
        hasAnchor: ((raw['Anchor'] as string) || '').includes('✅'),
    };
}

// ─── Public API ──────────────────────────────────────────────────────

export async function getAllIPOs(): Promise<IPOData[]> {
    const raw = await fetchRawIPOs();
    return raw.map(parseRecord);
}

export async function getIPOBySlug(slug: string): Promise<IPOData | null> {
    const ipos = await getAllIPOs();
    return ipos.find(ipo => ipo.slug === slug) || null;
}

export async function getLiveIPOs(): Promise<IPOData[]> {
    const ipos = await getAllIPOs();
    return ipos.filter(ipo => ipo.status === 'Live');
}

export async function getUpcomingIPOs(): Promise<IPOData[]> {
    const ipos = await getAllIPOs();
    return ipos.filter(ipo => ipo.status === 'Upcoming');
}

export async function getListedIPOs(): Promise<IPOData[]> {
    const ipos = await getAllIPOs();
    return ipos.filter(ipo => ipo.status === 'Listed');
}
