import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getEmailProvider } from '@/lib/email';
import { generateNewsletterContent } from '@/lib/newsletterGenerator';
import { buildRobustNewsletter } from '@/lib/emailTemplates/buildRobustNewsletter';
import { generateHeaderImage } from '@/lib/generateHeader';
import fs from 'fs';
import path from 'path';

const FROM = process.env.EMAIL_FROM ?? 'The Stack by Staqq <newsletter@staqq.in>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';

function getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
        ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
}

/** Injects an unsubscribe link into the newsletter HTML before the closing </body> */
function injectUnsubscribeLink(html: string, unsubscribeUrl: string): string {
    const link = `
<div style="text-align:center;padding:24px 0 8px;font-size:12px;color:#484f58;">
  Don't want these emails?
  <a href="${unsubscribeUrl}" style="color:#8b949e;text-decoration:underline;">Unsubscribe</a>
</div>`;
    return html.replace(/<\/body>/i, `${link}</body>`);
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

        // 2. Generate newsletter content once (shared for all)
        const content = await generateNewsletterContent();
        const baseHtml = buildRobustNewsletter(content);

        // 3. Generate header image
        const now = new Date();
        const weekOfYear = getWeekOfYear(now);
        const headerBuffer = await generateHeaderImage({ issueNumber: weekOfYear, date: now });
        const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'finale.png'));

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
                    await emailProvider.send({
                        to: email,
                        from: FROM,
                        subject,
                        html,
                        attachments: [
                            {
                                filename: 'header.png',
                                content: headerBuffer,
                                contentType: 'image/png',
                                contentId: 'newsletter-header',
                            },
                            {
                                filename: 'finale.png',
                                content: logoBuffer,
                                contentType: 'image/png',
                                contentId: 'newsletter-logo',
                            },
                        ],
                    });
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
