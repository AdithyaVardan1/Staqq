import OpenAI from 'openai';

// Initialize OpenAI client only if API key is present
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function summarizeArticle(title: string, content: string): Promise<string | null> {
    // 1. Fail fast if no API key
    if (!openai) return null;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Very cheap and fast
            messages: [
                {
                    role: "system",
                    content: "You are a financial news editor. Summarize the provided news article content into exactly 2 clear, professional sentences. Focus on the core facts, numbers, and financial impact. Do not start with 'The article discusses...'. Just state the facts. Do not use Markdown."
                },
                {
                    role: "user",
                    content: `Title: ${title}\n\nContent Snippet: ${content}`
                }
            ],
            max_tokens: 150,
            temperature: 0.3,
        });

        const summary = completion.choices[0]?.message?.content?.trim();
        return summary || null; // Return null if empty to trigger fallback
    } catch (error: any) {
        // 2. Fail gracefully on rate limits or quota issues
        console.warn(`[OpenAI] Summarization failed (using fallback): ${error.message}`);
        return null;
    }
}
