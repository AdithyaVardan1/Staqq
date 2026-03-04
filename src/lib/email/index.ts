/**
 * Email provider factory.
 *
 * Usage (anywhere in the app):
 *   import { getEmailProvider } from '@/lib/email';
 *   await getEmailProvider().send({ to, from, subject, html });
 *
 * To switch providers:
 *   1. Add a new file in ./providers/<provider>.ts implementing EmailProvider
 *   2. Set EMAIL_PROVIDER=<provider> in your env vars
 *   3. Add the new case below
 */

import type { EmailProvider } from './types';
import { MailDiverProvider } from './providers/maildiver';
import { UniOneProvider } from './providers/unione';
import { BrevoProvider } from './providers/brevo';

let _instance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
    if (_instance) return _instance;

    const provider = process.env.EMAIL_PROVIDER ?? 'brevo';

    switch (provider) {
        case 'brevo':
            _instance = new BrevoProvider(process.env.BREVO_API_KEY ?? '');
            break;
        case 'unione':
            _instance = new UniOneProvider(process.env.UNIONE_API_KEY ?? '');
            break;
        case 'maildiver':
            _instance = new MailDiverProvider(process.env.MAILDIVER_API_KEY ?? '');
            break;
        default:
            throw new Error(
                `[Email] Unknown provider "${provider}". Add a case in src/lib/email/index.ts.`
            );
    }

    return _instance;
}

export type { EmailProvider, SendEmailOptions, SendEmailResult } from './types';
