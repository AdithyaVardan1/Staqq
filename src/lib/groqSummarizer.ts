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
