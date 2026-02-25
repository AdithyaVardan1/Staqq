import { NextRequest, NextResponse } from 'next/server';
import { generateNewsletterContent } from '@/lib/newsletterGenerator';
import { buildRobustNewsletter } from '@/lib/emailTemplates/buildRobustNewsletter';
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

        // Fire-and-forget: generate live content and send
        (async () => {
            try {
                console.log('[Newsletter] Generating live content from Tavily + Groq...');
                const content = await generateNewsletterContent();

                console.log('[Newsletter] Building HTML...');
                const htmlContent = buildRobustNewsletter(content);

                // Derive issue number from week-of-year (first week of 2026 = Issue 1)
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const weekOfYear = Math.ceil(
                    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
                );

                // Generate header PNG dynamically with correct date + issue number
                console.log('[Newsletter] Generating header image...');
                const { generateHeaderImage } = await import('@/lib/generateHeader');
                const headerBuffer = await generateHeaderImage({ issueNumber: weekOfYear, date: now });

                const fs = await import('fs');
                const logoBuffer = fs.readFileSync(
                    `${process.cwd()}/public/finale.png`
                );

                console.log(`[Newsletter] Sending to ${email}...`);
                const result = await sendEmail({
                    to: email,
                    subject: `The Stack by Staqq — ${content.issueDate}`,
                    html: htmlContent,
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

                console.log('[Newsletter] Sent successfully:', result);
            } catch (err: any) {
                console.error('[Newsletter] Background send error:', err.message);
            }
        })();

        // Respond immediately — content generation happens in background
        return NextResponse.json({
            success: true,
            message: 'Subscribed! Your newsletter is on its way — content is being generated live.',
        });
    } catch (error: any) {
        console.error('[Newsletter] Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to subscribe.' },
            { status: 500 }
        );
    }
}
