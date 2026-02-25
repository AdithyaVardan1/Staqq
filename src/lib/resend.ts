import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
    contentId?: string;
    headers?: Record<string, string>;
}

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'The Stack by Staqq <onboarding@resend.dev>',
            to,
            subject,
            html,
            attachments,
        });

        if (error) {
            console.error('[Resend] Error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err: any) {
        console.error('[Resend] Send failed:', err.message);
        throw err;
    }
}
