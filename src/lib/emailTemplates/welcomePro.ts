const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';

export function buildWelcomeProEmail(name: string): string {
    const displayName = name || 'there';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Staqq Pro</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid rgba(202,255,0,0.15);overflow:hidden;">

        <!-- Accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#0A0A0A,#CAFF00 30%,#CAFF00 70%,#0A0A0A);"></td></tr>

        <tr><td style="padding:36px 40px;">

          <!-- Badge -->
          <div style="display:inline-block;padding:6px 14px;background:rgba(202,255,0,0.1);border:1px solid rgba(202,255,0,0.3);border-radius:100px;margin-bottom:24px;">
            <span style="font-size:11px;font-weight:800;color:#CAFF00;text-transform:uppercase;letter-spacing:0.1em;">PRO MEMBER</span>
          </div>

          <!-- Header -->
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.03em;">
            Welcome to Staqq Pro, ${displayName}!
          </h1>
          <p style="margin:0 0 28px;font-size:16px;color:#A1A1AA;line-height:1.5;">
            You now have full access to India&rsquo;s smartest market intelligence terminal.
          </p>

          <!-- Features -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
            <tr><td style="padding:20px;">
              <div style="font-size:11px;font-weight:700;color:#CAFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">What&rsquo;s unlocked</div>

              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E4E4E7;">
                &#9889; Real-time signals (no 30-min delay)
              </div>
              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E4E4E7;">
                &#128276; Unlimited alert subscriptions
              </div>
              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E4E4E7;">
                &#128200; Composite IPO Score (1-10)
              </div>
              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E4E4E7;">
                &#9993;&#65039; Daily morning market brief
              </div>
              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:#E4E4E7;">
                &#128203; Export to PDF &amp; Excel
              </div>
              <div style="padding:8px 0;font-size:14px;color:#E4E4E7;">
                &#128081; Custom alert rules engine
              </div>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center">
              <a href="${APP_URL}/signals" style="display:inline-block;padding:14px 32px;background:#CAFF00;color:#0A0A0A;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;letter-spacing:0.03em;">OPEN TERMINAL &rarr;</a>
            </td></tr>
          </table>

          <!-- Footer -->
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:#52525B;line-height:1.6;">
            Questions? Reply to this email anytime.
            <br>
            <a href="${APP_URL}" style="color:#A1A1AA;text-decoration:none;">staqq.in</a>
          </div>

        </td></tr>

        <!-- Bottom accent -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#0A0A0A,#CAFF00 30%,#CAFF00 70%,#0A0A0A);"></td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
