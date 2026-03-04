import { NextRequest, NextResponse } from 'next/server';
import { getEmailProvider } from '@/lib/email';
import { generateNewsletterContent } from '@/lib/newsletterGenerator';
import { buildRobustNewsletter } from '@/lib/emailTemplates/buildRobustNewsletter';

const FROM = process.env.EMAIL_FROM ?? 'The Stack by Staqq <newsletter@staqq.in>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';

/**
 * POST /api/newsletter/test-send
 *
 * Sends a single draft newsletter to the provided email address.
 * Does NOT touch the subscriber list — purely for testing.
 *
 * Headers:
 *   x-cron-secret: <CRON_SECRET>
 *
 * Body:
 *   { "email": "you@example.com" }
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json().catch(() => ({}));
    if (!email) {
        return NextResponse.json({ error: 'Body must include { "email": "..." }' }, { status: 400 });
    }

    try {
        console.log(`[test-send] Generating newsletter for ${email}...`);

        const content = await generateNewsletterContent();
        const baseHtml = buildRobustNewsletter(content);
        const subject = `[TEST] The Stack by Staqq — ${content.issueDate}`;

        // Add a prominent test banner so the email is unmistakeably a draft
        const htmlWithBanner = baseHtml.replace(
            /<body/i,
            `<div style="background:#b91c1c;color:#fff;text-align:center;padding:10px;font-family:sans-serif;font-size:13px;font-weight:600;">
              ⚠️ TEST EMAIL — NOT SENT TO SUBSCRIBERS
            </div><body`
        );

        const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?token=test-token`;
        const html = htmlWithBanner.replace(
            /<\/body>/i,
            `<div style="text-align:center;padding:24px 0 8px;font-size:12px;color:#484f58;">
              Don't want these emails?
              <a href="${unsubscribeUrl}" style="color:#8b949e;text-decoration:underline;">Unsubscribe</a>
            </div></body>`
        );

        await getEmailProvider().send({ to: email, from: FROM, subject, html });

        console.log(`[test-send] Done. Email sent to ${email}`);
        return NextResponse.json({ success: true, sentTo: email });
    } catch (error: any) {
        console.error('[test-send] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
