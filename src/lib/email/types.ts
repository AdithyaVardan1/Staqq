/**
 * Provider-agnostic email abstraction layer.
 * All email providers must implement the EmailProvider interface.
 * To switch providers: add a new file in ./providers/, update EMAIL_PROVIDER env var.
 */

export interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
    /** Used for inline CID references in HTML, e.g. <img src="cid:newsletter-header"> */
    contentId?: string;
}

export interface SendEmailOptions {
    to: string | string[];
    from: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}

export interface SendEmailResult {
    id?: string;
}

export interface EmailProvider {
    send(options: SendEmailOptions): Promise<SendEmailResult>;
}
