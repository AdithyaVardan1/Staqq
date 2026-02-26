import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const successHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribed — The Stack by Staqq</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;max-width:440px;padding:40px 24px;">
    <div style="font-size:48px;margin-bottom:16px;">👋</div>
    <h1 style="font-size:24px;font-weight:700;margin:0 0 12px;">You've been unsubscribed</h1>
    <p style="font-size:15px;color:#8b949e;line-height:1.6;margin:0 0 28px;">
      You won't receive any more issues of <strong style="color:#e6edf3;">The Stack</strong>.
      Changed your mind? You can always re-subscribe on our site.
    </p>
    <a href="/" style="display:inline-block;background:#238636;color:#fff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;">
      Go to Staqq
    </a>
  </div>
</body>
</html>
`;

const errorHtml = (msg: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Error — The Stack</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',sans-serif;color:#e6edf3;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;max-width:440px;padding:40px 24px;">
    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">Something went wrong</h1>
    <p style="color:#8b949e;font-size:14px;">${msg}</p>
  </div>
</body>
</html>
`;

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return new NextResponse(errorHtml('Missing unsubscribe token.'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' },
        });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false })
        .eq('unsubscribe_token', token);

    if (error) {
        console.error('[Unsubscribe] DB error:', error.message);
        return new NextResponse(errorHtml('Invalid or expired unsubscribe link.'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' },
        });
    }

    return new NextResponse(successHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
    });
}
