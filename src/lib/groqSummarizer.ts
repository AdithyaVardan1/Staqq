import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

const SYSTEM_PROMPT =
    'You are a financial news editor for an Indian market newsletter. ' +
    'Summarize the following news article in exactly 1 short, clear, factual sentence. ' +
    'Include key numbers, percentages, or names where relevant. ' +
    'Do not use any markdown formatting. Do not include phrases like "Read more" or "Click here".';

const BRIEF_SYSTEM_PROMPT =
    'You are a financial news editor. ' +
    'Summarize the article in one very brief phrase, maximum 12-15 words. ' +
    'Be direct and factual. No markdown. No filler words.';

export async function summarizeArticle(title: string, content: string, brief = false): Promise<string | null> {
    if (!groq) {
        console.warn('[Groq] No API key configured, skipping summarization.');
        return null;
    }

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: brief ? BRIEF_SYSTEM_PROMPT : SYSTEM_PROMPT },
                { role: 'user', content: `Title: ${title}\n\nContent: ${content.slice(0, 800)}` },
            ],
            max_tokens: brief ? 60 : 200,
            temperature: 0.2,
        });

        const summary = completion.choices[0]?.message?.content?.trim();
        if (!summary || summary.length < 10) return null;

        return summary;
    } catch (error: any) {
        console.warn(`[Groq] Summarization failed for "${title}" (using fallback): ${error.message}`);
        return null;
    }
}

/**
 * Generate a section-level overview from multiple article titles/summaries.
 * Used for the Big Picture section header.
 */
export async function summarizeSection(articles: { title: string; content: string }[]): Promise<string | null> {
    if (!groq || articles.length === 0) return null;

    const articleList = articles
        .map((a, i) => `${i + 1}. ${a.title}: ${a.content}`)
        .join('\n');

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a financial news editor for an Indian market newsletter. ' +
                        'Write a brief 2-3 sentence overview paragraph that captures the overall market mood and key themes from the articles below. ' +
                        'Be conversational but professional. Include specific numbers if available. ' +
                        'Do not use markdown. Do not list individual articles.',
                },
                { role: 'user', content: articleList },
            ],
            max_tokens: 200,
            temperature: 0.3,
        });

        const overview = completion.choices[0]?.message?.content?.trim();
        if (!overview || overview.length < 20) return null;

        return overview;
    } catch (error: any) {
        console.warn(`[Groq] Section summary failed (skipping): ${error.message}`);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Structured extractors for newsletter-robust.html sections
// ─────────────────────────────────────────────────────────────

export interface MarketAlert {
    label: string;   // e.g. "Market Alert — RBI Policy Week"
    body: string;    // 1-2 sentence summary
    boldPhrase: string; // a short phrase to bold (e.g. "surprising the market")
}

export interface NumberOfWeek {
    number: string;     // e.g. "−14%" or "+2.3%"
    subtitle: string;   // e.g. "Nifty 50 · Weekly Return"
    headline: string;   // e.g. "India's IT giants are in a slow bleed."
    detail: string;     // 1 sentence detail
}

export interface IPOSpotlight {
    name: string;       // Company name
    category: string;   // e.g. "Mainboard" or "SME"
    price: string;      // e.g. "₹406"
    gmp: string;        // e.g. "+₹20" or "—"
    estimated: string;  // listing estimate e.g. "₹426"
    closeDate: string;  // e.g. "26 Feb"
    verdict: 'Apply' | 'Avoid' | 'Neutral';
    note: string;       // brief rationale
    description: string; // ~10-word description of what the company does
}

export interface ConceptOfWeek {
    term: string;       // e.g. "GMP — Grey Market Premium"
    subtitle: string;   // e.g. "What it is · Why it lies sometimes"
    body: string;       // 2-3 sentence explanation
}

async function callGroq(systemPrompt: string, userContent: string, maxTokens = 300): Promise<string | null> {
    if (!groq) return null;
    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            max_tokens: maxTokens,
            temperature: 0.25,
            response_format: { type: 'json_object' },
        });
        return completion.choices[0]?.message?.content?.trim() || null;
    } catch (error: any) {
        console.warn(`[Groq] Extraction failed: ${error.message}`);
        return null;
    }
}

/**
 * Extract the most notable market alert from regulatory/market news.
 */
export async function extractMarketAlert(
    articles: { title: string; content: string }[]
): Promise<MarketAlert> {
    const fallback: MarketAlert = {
        label: 'Market Watch',
        body: articles[0]?.content || 'Markets remain volatile. Stay alert.',
        boldPhrase: 'Stay alert',
    };

    if (!groq || articles.length === 0) return fallback;

    const input = articles.slice(0, 3).map((a, i) => `${i + 1}. ${a.title}: ${a.content}`).join('\n');

    const raw = await callGroq(
        'You are a financial news editor. From the articles below, pick the single most market-impactful event. ' +
        'Return a JSON object with EXACTLY these keys: ' +
        '"label" (string: "Market Alert — [Topic]", max 8 words), ' +
        '"body" (string: 2 clear sentences about the event, no markdown), ' +
        '"boldPhrase" (string: a 2-4 word phrase from body to emphasize, must appear verbatim in body). ' +
        'Return ONLY the JSON object, nothing else.',
        input,
        250
    );

    try {
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.label && parsed.body && parsed.boldPhrase) return parsed as MarketAlert;
        }
    } catch { /* fall through */ }

    return fallback;
}

/**
 * Extract a standout number/stat for the "Number of the Week" section.
 * The "number" field must be ONLY the bare number/stat — no unit words like "points", "crore", etc.
 */
export async function extractNumberOfWeek(
    articles: { title: string; content: string }[]
): Promise<NumberOfWeek> {
    const fallback: NumberOfWeek = {
        number: '—',
        subtitle: 'Indian Markets',
        headline: 'Key market movement this week.',
        detail: articles[0]?.content || 'Check the markets for the latest updates.',
    };

    if (!groq || articles.length === 0) return fallback;

    const input = articles.slice(0, 5).map((a, i) => `${i + 1}. ${a.title}: ${a.content}`).join('\n');

    const raw = await callGroq(
        'You are a financial news editor. From the articles below, find the single most dramatic/interesting number or percentage. ' +
        'Return a JSON object with EXACTLY these keys: ' +
        '"number" (string: ONLY the bare number with sign and symbol — NO unit words like "points", "crore", "lakh". ' +
        'Examples: "−1,236", "+2.3%", "₹420", "−14%". If it is a point move, just write the number like "−1,236". If a percentage, include the % sign.), ' +
        '"subtitle" (string: "StockOrIndex · Context", e.g. "Sensex · Daily Drop", max 6 words, use · as separator), ' +
        '"headline" (string: short punchy headline about what this number means, max 12 words), ' +
        '"detail" (string: one factual sentence with more context, no markdown). ' +
        'Return ONLY the JSON object, nothing else.',
        input,
        250
    );

    try {
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.number && parsed.subtitle && parsed.headline && parsed.detail) return parsed as NumberOfWeek;
        }
    } catch { /* fall through */ }

    return fallback;
}

/**
 * Generate a verdict for an IPO using Groq based on its data.
 */
export async function generateIPOVerdict(
    ipoName: string,
    ipoData: string
): Promise<{ verdict: 'Apply' | 'Avoid' | 'Neutral'; note: string; description: string }> {
    const fallback = { verdict: 'Neutral' as const, note: 'Assess based on fundamentals.', description: 'Indian company listing on stock exchange.' };
    if (!groq) return fallback;

    const raw = await callGroq(
        'You are a concise Indian IPO analyst. Given the IPO data, decide if retail investors should Apply, Avoid, or stay Neutral. ' +
        'Return a JSON object with EXACTLY these keys: ' +
        '"verdict" (string: MUST be exactly one of "Apply", "Avoid", or "Neutral"), ' +
        '"note" (string: one brief reason, max 10 words, no markdown), ' +
        '"description" (string: 2-3 sentences, 30-40 words, describing what the company does and why this IPO is noteworthy, no markdown, factual). ' +
        'Return ONLY the JSON object, nothing else.',
        `IPO: ${ipoName}\nData: ${ipoData}`,
        200
    );

    try {
        if (raw) {
            const parsed = JSON.parse(raw);
            if (['Apply', 'Avoid', 'Neutral'].includes(parsed.verdict)) {
                return {
                    verdict: parsed.verdict,
                    note: parsed.note || fallback.note,
                    description: parsed.description || fallback.description,
                };
            }
        }
    } catch { /* fall through */ }

    return fallback;
}

/**
 * Generate a "Concept of the Week" explainer based on current news themes.
 */
export async function extractConceptOfWeek(
    articles: { title: string; content: string }[]
): Promise<ConceptOfWeek> {
    const fallback: ConceptOfWeek = {
        term: 'P/E Ratio — Price to Earnings',
        subtitle: 'What it is · How to use it',
        body: 'The P/E ratio compares a stock\'s price to its earnings per share, helping investors judge if a stock is cheap or expensive relative to its profits. A high P/E can mean growth expectations are priced in — or that a stock is overvalued. Always compare P/E within the same sector.',
    };

    if (!groq || articles.length === 0) return fallback;

    const input = articles.slice(0, 5).map((a) => a.title).join(', ');

    const raw = await callGroq(
        'You are a financial educator for a Gen Z Indian investing newsletter. ' +
        'Based on the news topics provided, pick ONE financial concept that retail investors should understand this week (it should be relevant to the news). ' +
        'Return a JSON object with EXACTLY these keys: ' +
        '"term" (string: "ConceptName — Full Name", e.g. "GMP — Grey Market Premium"), ' +
        '"subtitle" (string: "What it is · Why it matters", max 8 words, use · as separator), ' +
        '"body" (string: 3 clear sentences explaining the concept for a beginner, connecting it to current events, no markdown). ' +
        'Return ONLY the JSON object, nothing else.',
        `Current news topics: ${input}`,
        350
    );

    try {
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.term && parsed.subtitle && parsed.body) return parsed as ConceptOfWeek;
        }
    } catch { /* fall through */ }

    return fallback;
}

export interface TopStory {
    title: string;
    content: string;
    url: string;
}

/**
 * Given a merged pool of articles from all Tavily feeds, ask Groq to pick
 * the 2 most impactful stories for Indian retail investors this week.
 * Falls back to top 2 by Tavily relevance score.
 */
export async function pickTopStories(
    articles: { title: string; content: string; url: string; score?: number }[]
): Promise<TopStory[]> {
    const fallback = articles
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 2)
        .map(a => ({ title: a.title, content: a.content, url: a.url }));

    if (!groq || articles.length === 0) return fallback;

    // Send titles + indices to Groq — it picks indices, we map back
    const numbered = articles
        .slice(0, 12)
        .map((a, i) => `${i}: ${a.title}`)
        .join('\n');

    const raw = await callGroq(
        'You are a curator for an Indian retail investor newsletter. ' +
        'From the numbered list of news headlines, pick the 2 most impactful and interesting stories for a Gen Z Indian retail investor this week. ' +
        'Prioritise: regulatory changes, major market moves, IPO news, significant company news. Avoid generic macro filler. ' +
        'Return a JSON array of exactly 2 numbers (the indices), e.g. [3, 7]. Return ONLY the JSON array, nothing else.',
        `Headlines:\n${numbered}`,
        60
    );

    try {
        if (raw) {
            const indices: number[] = JSON.parse(raw);
            if (
                Array.isArray(indices) &&
                indices.length === 2 &&
                indices.every(i => typeof i === 'number' && i >= 0 && i < articles.length)
            ) {
                return indices.map(i => ({
                    title: articles[i].title,
                    content: articles[i].content,
                    url: articles[i].url,
                }));
            }
        }
    } catch { /* fall through */ }

    return fallback;
}
