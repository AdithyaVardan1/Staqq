import type { IPOData } from './ipo';
import { calculateIPOScore } from './ipoScore';
import { getGmpSentiment } from './ipoAnalytics';

interface BlogPost {
    slug: string;
    title: string;
    description: string;
    content: string;
    category: string;
    ipo_slug: string;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'TBA';
    return dateStr;
}

function getVerdict(score: number): string {
    if (score >= 8) return 'This IPO looks strong across all parameters. High GMP, solid subscription interest, and good company fundamentals make it a compelling opportunity for retail investors.';
    if (score >= 6.5) return 'This IPO shows promising signals overall. The combination of positive GMP and decent subscription numbers suggests market confidence, though investors should still do their own due diligence.';
    if (score >= 5) return 'This is a mixed-signal IPO. Some indicators look favorable while others are neutral. Conservative investors may want to wait for more clarity on subscription numbers before deciding.';
    if (score >= 3.5) return 'Caution is warranted here. The data shows below-average signals on key metrics. Unless you have strong conviction about the company fundamentals, it might be worth sitting this one out.';
    return 'The numbers do not look encouraging for this IPO. Negative GMP sentiment and weak subscription interest suggest the market is not excited. Consider avoiding unless you see something the market is missing.';
}

function getGmpAnalysis(ipo: IPOData): string {
    const sentiment = getGmpSentiment(ipo.gmpPercent);

    if (ipo.gmp === null || ipo.gmpPercent === null) {
        return 'GMP data is not yet available for this IPO. This usually means the grey market has not started trading the shares, which is common for IPOs that are still a few days away from opening.';
    }

    const direction = ipo.gmpPercent >= 0 ? 'positive' : 'negative';
    const amount = Math.abs(ipo.gmp);
    const pct = Math.abs(ipo.gmpPercent);

    if (ipo.gmpPercent >= 50) {
        return `The grey market is extremely bullish on ${ipo.name}, with a GMP of +₹${amount} (+${pct}%). This level of premium indicates strong demand from HNI and institutional investors even before listing. At an issue price of ${ipo.price ? '₹' + ipo.price : 'TBA'}, the estimated listing price works out to ₹${ipo.estListing || 'TBA'}.`;
    }
    if (ipo.gmpPercent >= 10) {
        return `${ipo.name} is trading at a healthy GMP of +₹${amount} (+${pct}%) in the grey market. The sentiment is ${sentiment.label.toLowerCase()}, suggesting the market expects a decent listing gain. With an issue price of ${ipo.price ? '₹' + ipo.price : 'TBA'}, the estimated listing price is around ₹${ipo.estListing || 'TBA'}.`;
    }
    if (ipo.gmpPercent >= 0) {
        return `The GMP for ${ipo.name} is currently at +₹${amount} (+${pct}%), which is a modest premium. The market sentiment is neutral to slightly positive. This suggests the IPO may list near or slightly above the issue price of ${ipo.price ? '₹' + ipo.price : 'TBA'}.`;
    }
    return `${ipo.name} is showing a ${direction} GMP of -₹${amount} (-${pct}%), which means the grey market expects it to list below the issue price. The sentiment is ${sentiment.label.toLowerCase()}. Investors should be cautious as negative GMP often correlates with poor listing performance.`;
}

function getSubscriptionAnalysis(ipo: IPOData): string {
    if (!ipo.subscriptionNum || ipo.subscriptionNum === 0) {
        if (ipo.status === 'Upcoming') {
            return 'Subscription data will be available once the IPO opens for bidding.';
        }
        return 'Subscription data is not yet available for this IPO.';
    }

    const sub = ipo.subscriptionNum;
    if (sub >= 20) {
        return `${ipo.name} has been subscribed ${sub}x, which is exceptional. This level of oversubscription means heavy competition for allotment, especially in the retail category. If you applied with a single lot, your allotment probability is roughly ${Math.round(100 / sub)}%.`;
    }
    if (sub >= 5) {
        return `The IPO is ${sub}x subscribed, indicating strong investor interest. This is a healthy subscription level that typically correlates with positive listing performance. Allotment probability in the retail category is approximately ${Math.round(100 / sub)}%.`;
    }
    if (sub >= 1) {
        return `${ipo.name} is ${sub}x subscribed so far. While the IPO is fully subscribed, the oversubscription is moderate. This usually means most retail applicants will get allotment, and listing gains may be modest.`;
    }
    return `The IPO has a subscription of ${sub}x, meaning it has not been fully subscribed yet. This could indicate tepid investor interest, and investors should watch for improvement in subscription numbers before the close date.`;
}

export function generateIPOAnalysis(ipo: IPOData): BlogPost {
    const score = calculateIPOScore(ipo);
    const sentiment = getGmpSentiment(ipo.gmpPercent);
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const gmpStr = ipo.gmpPercent !== null
        ? `${ipo.gmpPercent >= 0 ? '+' : ''}${ipo.gmpPercent}%`
        : 'N/A';

    const slug = `${ipo.slug}-ipo-gmp-analysis`;

    const title = ipo.gmpPercent !== null
        ? `${ipo.name} IPO GMP Today: ${gmpStr} | Analysis & Score`
        : `${ipo.name} IPO Analysis: Should You Apply?`;

    const description = `${ipo.name} IPO GMP is ${gmpStr} as of ${today}. Read our analysis covering grey market premium, subscription status, composite score (${score.overall}/10), and whether you should apply.`;

    const content = `
## ${ipo.name} IPO Overview

| Detail | Value |
|--------|-------|
| **Issue Price** | ${ipo.price ? '₹' + ipo.price : 'TBA'} |
| **GMP** | ${ipo.gmp !== null ? (ipo.gmp >= 0 ? '+' : '') + '₹' + ipo.gmp : 'N/A'} |
| **GMP %** | ${gmpStr} |
| **Estimated Listing** | ${ipo.estListing ? '₹' + ipo.estListing : 'TBA'} |
| **Subscription** | ${ipo.subscription || 'N/A'} |
| **Lot Size** | ${ipo.lotSize || 'TBA'} shares |
| **IPO Size** | ${ipo.ipoSizeCr ? '₹' + ipo.ipoSizeCr + ' Cr' : 'TBA'} |
| **Category** | ${ipo.category} |
| **Open Date** | ${formatDate(ipo.openDate)} |
| **Close Date** | ${formatDate(ipo.closeDate)} |
| **Listing Date** | ${formatDate(ipo.listingDate)} |
| **Sentiment** | ${sentiment.label} |

## Staqq Score: ${score.overall}/10 (${score.label})

Our composite score evaluates this IPO across four key dimensions:

- **GMP Signal**: ${score.components.gmpSignal.toFixed(1)}/10 (35% weight)
- **Subscription Strength**: ${score.components.subscriptionStrength.toFixed(1)}/10 (30% weight)
- **Company Quality**: ${score.components.companyQuality.toFixed(1)}/10 (20% weight)
- **Issue Size Signal**: ${score.components.issueSizeSignal.toFixed(1)}/10 (15% weight)

**Confidence**: ${score.confidence}

## GMP Analysis

${getGmpAnalysis(ipo)}

## Subscription Status

${getSubscriptionAnalysis(ipo)}

## Should You Apply?

${getVerdict(score.overall)}

---

*Last updated: ${today}. GMP and subscription data change frequently. Check the [${ipo.name} IPO page](/ipo/${ipo.slug}) for the latest numbers.*

*Data sourced from grey market dealers and exchange filings. GMP is an unofficial indicator and should not be the sole basis for investment decisions.*
`.trim();

    return {
        slug,
        title,
        description,
        content,
        category: 'ipo-analysis',
        ipo_slug: ipo.slug,
    };
}

export function generateWeeklyRoundup(ipos: IPOData[]): BlogPost {
    const live = ipos.filter(i => i.status === 'Live');
    const upcoming = ipos.filter(i => i.status === 'Upcoming');
    const listed = ipos.filter(i => i.status === 'Listed').slice(0, 5);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekStr = weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const slug = `ipo-market-weekly-${now.toISOString().slice(0, 10)}`;

    const title = `IPO Market This Week: ${live.length} Live, ${upcoming.length} Upcoming`;
    const description = `Weekly IPO market roundup for the week of ${weekStr}. ${live.length} IPOs currently open for subscription, ${upcoming.length} upcoming. GMP analysis and scores for all active IPOs.`;

    let liveSection = '';
    if (live.length > 0) {
        const rows = live.map(ipo => {
            const score = calculateIPOScore(ipo);
            const gmpStr = ipo.gmpPercent !== null ? `${ipo.gmpPercent >= 0 ? '+' : ''}${ipo.gmpPercent}%` : 'N/A';
            return `| [${ipo.name}](/ipo/${ipo.slug}) | ${ipo.price ? '₹' + ipo.price : 'TBA'} | ${gmpStr} | ${ipo.subscription || 'N/A'} | ${score.overall}/10 |`;
        }).join('\n');
        liveSection = `## Live IPOs\n\n| Company | Price | GMP | Subscription | Score |\n|---------|-------|-----|--------------|-------|\n${rows}\n\n`;
    } else {
        liveSection = '## Live IPOs\n\nNo IPOs are currently open for subscription.\n\n';
    }

    let upcomingSection = '';
    if (upcoming.length > 0) {
        const rows = upcoming.slice(0, 10).map(ipo => {
            const gmpStr = ipo.gmpPercent !== null ? `${ipo.gmpPercent >= 0 ? '+' : ''}${ipo.gmpPercent}%` : 'N/A';
            return `| [${ipo.name}](/ipo/${ipo.slug}) | ${ipo.price ? '₹' + ipo.price : 'TBA'} | ${gmpStr} | ${formatDate(ipo.openDate)} |`;
        }).join('\n');
        upcomingSection = `## Upcoming IPOs\n\n| Company | Price | GMP | Opens |\n|---------|-------|-----|-------|\n${rows}\n\n`;
    }

    let listedSection = '';
    if (listed.length > 0) {
        const rows = listed.map(ipo => {
            const gmpStr = ipo.gmpPercent !== null ? `${ipo.gmpPercent >= 0 ? '+' : ''}${ipo.gmpPercent}%` : 'N/A';
            return `| [${ipo.name}](/ipo/${ipo.slug}) | ${ipo.price ? '₹' + ipo.price : 'TBA'} | ${gmpStr} | ${ipo.subscription || 'N/A'} |`;
        }).join('\n');
        listedSection = `## Recently Listed\n\n| Company | Price | GMP at Listing | Final Subscription |\n|---------|-------|----------------|--------------------|\n${rows}\n\n`;
    }

    const content = `
${liveSection}${upcomingSection}${listedSection}

## Market Overview

This week the Indian IPO market has **${live.length}** IPOs open for subscription and **${upcoming.length}** in the pipeline. ${live.length > 0 ? `The most subscribed IPO right now is **${live.sort((a, b) => (b.subscriptionNum || 0) - (a.subscriptionNum || 0))[0]?.name}**.` : ''}

For detailed analysis on any IPO, visit the [IPO Hub](/ipo) or check individual IPO pages for live GMP updates and subscription tracking.

---

*Updated weekly. For real-time GMP and subscription data, visit [staqq.in/ipo](/ipo).*
`.trim();

    return {
        slug,
        title,
        description,
        content,
        category: 'weekly-roundup',
        ipo_slug: '',
    };
}
