import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getEmailProvider } from '@/lib/email';

const FROM = process.env.EMAIL_FROM ?? 'The Stack by Staqq <newsletter@staqq.in>';

const welcomeHtml = (email: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',sans-serif;color:#e6edf3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;padding:48px 40px;border:1px solid #30363d;">
        <tr><td align="center" style="padding-bottom:32px;">
          <div style="font-size:28px;font-weight:700;color:#e6edf3;">You're in. 🎉</div>
        </td></tr>
        <tr><td style="font-size:16px;line-height:1.6;color:#8b949e;padding-bottom:28px;">
          Welcome to <strong style="color:#e6edf3;">The Stack</strong> — your weekly edge in Indian markets.
          <br /><br />
          Every Wednesday morning, you'll get a fresh issue with:
          <ul style="margin:16px 0;padding-left:20px;">
            <li>📈 Big picture market analysis</li>
            <li>🔔 Live IPO spotlight with GMP + verdict</li>
            <li>🧠 Concept of the week</li>
            <li>📰 Top stories curated by AI</li>
          </ul>
          Your first issue lands <strong style="color:#e6edf3;">this Wednesday</strong>. Keep an eye out!
        </td></tr>
        <tr><td align="center" style="padding-top:8px;font-size:12px;color:#484f58;">
          You're receiving this because ${email} subscribed to The Stack.
          <br />No noise. Unsubscribe anytime.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
        }

        // Upsert into Supabase — ignore duplicates gracefully
        const supabase = createAdminClient();
        const { error: dbError } = await supabase
            .from('newsletter_subscribers')
            .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

        if (dbError) {
            console.error('[Subscribe] Supabase error:', dbError.message);
            return NextResponse.json({ error: 'Failed to save subscription.' }, { status: 500 });
        }

        // Send welcome email (fire-and-forget — don't block the response)
        getEmailProvider()
            .send({
                to: email,
                from: FROM,
                subject: 'Welcome to The Stack by Staqq 🎉',
                html: welcomeHtml(email),
            })
            .catch((err) => console.error('[Subscribe] Welcome email failed:', err.message));

        return NextResponse.json({
            success: true,
            message: "You're subscribed! The Stack lands every Wednesday.",
        });
    } catch (error: any) {
        console.error('[Subscribe] Error:', error.message);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
