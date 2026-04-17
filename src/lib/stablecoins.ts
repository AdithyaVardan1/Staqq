// ─── Stablecoin Depeg Tracker ─────────────────────────────────────────
// Monitors major stablecoins and surfaces deviations from $1 peg.
// Data: CoinGecko free API (no key required).
// ─────────────────────────────────────────────────────────────────────

export interface StablecoinData {
    id: string;
    symbol: string;
    name: string;
    logo: string;
    price: number;
    deviation: number;       // absolute deviation from $1.00
    deviationPct: number;    // percentage deviation
    high24h: number;
    low24h: number;
    marketCap: number;
    volume24h: number;
    status: 'PEGGED' | 'CAUTION' | 'DEPEGGED' | 'DANGER';
    chain: string;           // primary chain
    updatedAt: string;
}

const STABLECOINS = [
    { id: 'tether',         symbol: 'USDT',  name: 'Tether',         chain: 'Multi-chain', logo: '💵' },
    { id: 'usd-coin',       symbol: 'USDC',  name: 'USD Coin',       chain: 'Multi-chain', logo: '🔵' },
    { id: 'dai',            symbol: 'DAI',   name: 'Dai',            chain: 'Ethereum',    logo: '🟡' },
    { id: 'frax',           symbol: 'FRAX',  name: 'Frax',           chain: 'Multi-chain', logo: '⚫' },
    { id: 'true-usd',       symbol: 'TUSD',  name: 'TrueUSD',        chain: 'Multi-chain', logo: '🟢' },
    { id: 'liquity-usd',    symbol: 'LUSD',  name: 'Liquity USD',    chain: 'Ethereum',    logo: '🟤' },
    { id: 'usdd',           symbol: 'USDD',  name: 'USDD',           chain: 'Tron',        logo: '🔴' },
    { id: 'paypal-usd',     symbol: 'PYUSD', name: 'PayPal USD',     chain: 'Ethereum',    logo: '🔷' },
    { id: 'first-digital-usd', symbol: 'FDUSD', name: 'First Digital USD', chain: 'BNB Chain', logo: '⬡' },
    { id: 'ethena-usde',    symbol: 'USDe',  name: 'Ethena USDe',    chain: 'Ethereum',    logo: '🌐' },
];

function getStatus(deviationPct: number): StablecoinData['status'] {
    const abs = Math.abs(deviationPct);
    if (abs >= 1.0) return 'DANGER';
    if (abs >= 0.5) return 'DEPEGGED';
    if (abs >= 0.2) return 'CAUTION';
    return 'PEGGED';
}

export async function getStablecoinData(): Promise<StablecoinData[]> {
    const ids = STABLECOINS.map(s => s.id).join(',');

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_high=true&include_24hr_low=true&include_market_cap=true&include_24hr_vol=true`;

    const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const raw = await res.json();
    const now = new Date().toISOString();

    return STABLECOINS.map(coin => {
        const d = raw[coin.id] || {};
        const price = d.usd ?? 1.0;
        const deviation = price - 1.0;
        const deviationPct = deviation * 100;

        return {
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            logo: coin.logo,
            chain: coin.chain,
            price,
            deviation,
            deviationPct,
            high24h: d.usd_24h_high ?? price,
            low24h: d.usd_24h_low ?? price,
            marketCap: d.usd_market_cap ?? 0,
            volume24h: d.usd_24h_vol ?? 0,
            status: getStatus(deviationPct),
            updatedAt: now,
        };
    }).sort((a, b) => Math.abs(b.deviationPct) - Math.abs(a.deviationPct));
}
