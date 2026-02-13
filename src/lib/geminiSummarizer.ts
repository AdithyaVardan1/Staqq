import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const model = genAI?.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
        maxOutputTokens: 600, // Enough for ~5 articles × 3 sentences each
        temperature: 0.2,
    },
});

const BATCH_PROMPT =
    'You are a financial news editor for an Indian market newsletter. ' +
    'Below are multiple news articles, each numbered. ' +
    'For EACH article, write exactly 3 clear, factual sentences summarizing it. ' +
    'Include key numbers, percentages, or names where relevant. ' +
    'Do not use any markdown formatting. Do not include "Read more" or "Click here". ' +
    'Format your response as:\n' +
    '1. [3-sentence summary for article 1]\n' +
    '2. [3-sentence summary for article 2]\n' +
    '...and so on.';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Summarize a batch of articles in a single API call.
 * Returns an array of summaries (same order as input), or null values for failures.
 */
export async function summarizeBatch(
    articles: { title: string; content: string }[]
): Promise<(string | null)[]> {
    if (!model || articles.length === 0) {
        return articles.map(() => null);
    }

    // Build the numbered article list for the prompt
    const articleList = articles
        .map((a, i) => `Article ${i + 1}:\nTitle: ${a.title}\nContent: ${a.content.slice(0, 500)}`)
        .join('\n\n');

    try {
        const result = await model.generateContent(
            `${BATCH_PROMPT}\n\n${articleList}`
        );

        const responseText = result.response?.text()?.trim();
        if (!responseText) return articles.map(() => null);

        // Parse numbered responses: "1. summary\n2. summary\n..."
        const summaries: (string | null)[] = [];

        for (let i = 0; i < articles.length; i++) {
            // Match "N. " or "N) " followed by the summary text
            const pattern = new RegExp(`${i + 1}[.)\\s]+(.+?)(?=\\n\\s*${i + 2}[.)\\s]|$)`, 's');
            const match = responseText.match(pattern);

            if (match && match[1]?.trim().length > 20) {
                summaries.push(match[1].trim());
            } else {
                summaries.push(null); // Will trigger fallback for this article
            }
        }

        return summaries;
    } catch (error: any) {
        const is429 = error.message?.includes('429');
        const is503 = error.message?.includes('503');

        if (is429 || is503) {
            // Wait and retry once
            console.warn(`[Gemini] ${is429 ? '429 Rate Limit' : '503 Overloaded'}. Retrying in 30s...`);
            await delay(30000);

            try {
                const result = await model.generateContent(
                    `${BATCH_PROMPT}\n\n${articleList}`
                );

                const responseText = result.response?.text()?.trim();
                if (!responseText) return articles.map(() => null);

                const summaries: (string | null)[] = [];
                for (let i = 0; i < articles.length; i++) {
                    const pattern = new RegExp(`${i + 1}[.)\\s]+(.+?)(?=\\n\\s*${i + 2}[.)\\s]|$)`, 's');
                    const match = responseText.match(pattern);
                    summaries.push(match && match[1]?.trim().length > 20 ? match[1].trim() : null);
                }
                return summaries;
            } catch {
                // Give up after retry
            }
        }

        console.warn(`[Gemini] Batch summarization failed (using fallback): ${error.message}`);
        return articles.map(() => null);
    }
}
