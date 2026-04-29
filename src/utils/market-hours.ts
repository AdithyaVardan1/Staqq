// NSE trading session: Mon-Fri, 9:00 AM – 4:30 PM IST
// After 4:30 PM prices are frozen; no point calling Angel One.

export function isMarketOpen(): boolean {
    const now = new Date();
    // Shift to IST (UTC+5:30)
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const day = ist.getUTCDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false;
    const t = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    return t >= 9 * 60 && t < 16 * 60 + 30; // 9:00–16:30
}

// How many seconds until the next market open (used for Redis TTL after close).
// Returns time until 9:00 AM next trading day, capped at 72h.
export function secondsUntilMarketOpen(): number {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const day = ist.getUTCDay();
    const t = ist.getUTCHours() * 60 + ist.getUTCMinutes();

    // Minutes from now until 9:00 AM today (if still before open) or tomorrow
    let daysAhead = 0;
    if (t >= 9 * 60) daysAhead = 1; // already past 9 AM, target next day's open

    // Skip weekend
    let targetDay = (day + daysAhead) % 7;
    if (targetDay === 6) daysAhead += 2; // Sat → Mon
    else if (targetDay === 0) daysAhead += 1; // Sun → Mon

    const secondsUntilMidnight = (24 * 60 - t) * 60;
    const secondsForExtraDays = (daysAhead - 1) * 24 * 60 * 60;
    const secondsFrom9AM = 9 * 60 * 60;

    return Math.min(secondsUntilMidnight + secondsForExtraDays + secondsFrom9AM, 72 * 3600);
}
