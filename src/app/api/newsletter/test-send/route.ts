import { NextRequest, NextResponse } from 'next/server';
import { generateNewsletterContent } from '@/lib/newsletterGenerator';
import { buildWeeklyNewsletter } from '@/lib/emailTemplates/weeklyNewsletter';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'A valid email address is required.' },
                { status: 400 }
            );
        }

        // Fire-and-forget: generate & send newsletter in the background
        // The user gets an instant response while this runs (~2-3 min)
        (async () => {
            try {
                console.log('[Newsletter] Generating content via Tavily...');
                const content = await generateNewsletterContent();

                console.log('[Newsletter] Building HTML template...');
                const html = buildWeeklyNewsletter(content, email);

                console.log(`[Newsletter] Sending to ${email}...`);
                const result = await sendEmail({
                    to: email,
                    subject: `📊 The Stack — ${content.issueDate} | Your Weekly Indian Market Edge`,
                    html,
                });

                console.log('[Newsletter] Sent successfully:', result);
            } catch (err: any) {
                console.error('[Newsletter] Background send error:', err.message);
            }
        })();

        // Respond immediately
        return NextResponse.json({
            success: true,
            message: 'Subscribed! Your newsletter is on its way.',
        });
    } catch (error: any) {
        console.error('[Newsletter] Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to subscribe.' },
            { status: 500 }
        );
    }
}
