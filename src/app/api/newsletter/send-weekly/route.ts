import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { getEmailProvider } from '@/lib/email';
import { generateNewsletterContent } from '@/lib/newsletterGenerator';
import { buildRobustNewsletter } from '@/lib/emailTemplates/buildRobustNewsletter';
import { generateHeaderImage } from '@/lib/generateHeader';

const FROM = process.env.EMAIL_FROM ?? 'The Stack by Staqq <newsletter@staqq.in>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const STORAGE_BUCKET = 'newsletter-assets';
const HEADER_REMOTE_PATH = 'header/weekly.png'; // overwritten each week

/** Injects an unsubscribe link into the newsletter HTML before the closing </body> */
function injectUnsubscribeLink(html: string, unsubscribeUrl: string): string {
    const link = `
<div style="text-align:center;padding:24px 0 8px;font-size:12px;color:#484f58;">
  Don't want these emails?
  <a href="${unsubscribeUrl}" style="color:#8b949e;text-decoration:underline;">Unsubscribe</a>
</div>`;
    return html.replace(/<\/body>/i, `${link}</body>`);
}

function getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
        ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
}

/**
 * Generates a fresh header image with the current week's date/issue number,
 * uploads it to Supabase Storage (overwrites previous week), and returns its public URL.
 */
async function generateAndUploadHeader(now: Date): Promise<string> {
    const weekOfYear = getWeekOfYear(now);
    const headerBuffer = await generateHeaderImage({ issueNumber: weekOfYear, date: now });

    const storage = createClient(
        SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    ).storage;

    const { error } = await storage.from(STORAGE_BUCKET).upload(HEADER_REMOTE_PATH, headerBuffer, {
        contentType: 'image/png',
        upsert: true, // overwrite last week's header
    });

    if (error) {
        console.warn('[send-weekly] Header upload failed, using default:', error.message);
        // Fall back to the static default header already in the bucket
        return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/header/default.png`;
    }

    // Bust the CDN cache by appending a timestamp query param
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${HEADER_REMOTE_PATH}?v=${now.getTime()}`;
    console.log('[send-weekly] Header uploaded:', publicUrl);
    return publicUrl;
}

export async function POST(req: NextRequest) {
    // Verify cron secret to prevent public triggering
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch all active subscribers
        const supabase = createAdminClient();
        const { data: subscribers, error: dbError } = await supabase
            .from('newsletter_subscribers')
            .select('email, unsubscribe_token')
            .eq('is_active', true);

        if (dbError) throw new Error(`Supabase fetch failed: ${dbError.message}`);
        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No active subscribers.' });
        }

        console.log(`[send-weekly] Sending to ${subscribers.length} subscribers...`);

        const now = new Date();

        // 2. Generate + upload a fresh header image for this week's issue (runs in parallel with content)
        const [content, weeklyHeaderUrl] = await Promise.all([
            generateNewsletterContent(),
            generateAndUploadHeader(now),
        ]);

        // 3. Build the newsletter HTML with the fresh weekly header URL
        const baseHtml = buildRobustNewsletter(content, weeklyHeaderUrl);
        const subject = `The Stack by Staqq — ${content.issueDate}`;
        const emailProvider = getEmailProvider();

        // 4. Send to each subscriber with their personal unsubscribe link
        let sent = 0;
        const errors: string[] = [];

        await Promise.allSettled(
            subscribers.map(async ({ email, unsubscribe_token }) => {
                const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?token=${unsubscribe_token}`;
                const html = injectUnsubscribeLink(baseHtml, unsubscribeUrl);

                try {
                    await emailProvider.send({ to: email, from: FROM, subject, html });
                    sent++;
                } catch (err: any) {
                    errors.push(`${email}: ${err.message}`);
                    console.error(`[send-weekly] Failed for ${email}:`, err.message);
                }
            })
        );

        console.log(`[send-weekly] Done. Sent: ${sent}, Errors: ${errors.length}`);
        return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined });
    } catch (error: any) {
        console.error('[send-weekly] Fatal error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
