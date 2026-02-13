import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'The Stack by Staqq <onboarding@resend.dev>',
            to,
            subject,
            html,
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
