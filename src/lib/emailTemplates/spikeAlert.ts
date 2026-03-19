import type { SpikeResult } from '@/lib/spikeDetector';

function esc(str: string | null | undefined): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';

export function buildSpikeAlertEmail(spike: SpikeResult): string {
    const { ticker, mentionCount, spikeMult, topPost } = spike;
    const stockUrl = `${APP_URL}/stocks/${ticker}`;
    const pulseUrl = `${APP_URL}/pulse`;
    const alertsUrl = `${APP_URL}/alerts`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staqq Alert: ${esc(ticker)} spiking</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0E0E0E;border-radius:16px;border:1px solid rgba(202,255,0,0.15);overflow:hidden;">

        <!-- Accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#0A0A0A,#CAFF00 30%,#CAFF00 70%,#0A0A0A);"></td></tr>

        <tr><td style="padding:36px 40px;">

          <!-- Badge -->
          <div style="display:inline-block;padding:6px 14px;background:rgba(202,255,0,0.1);border:1px solid rgba(202,255,0,0.3);border-radius:100px;margin-bottom:24px;">
            <span style="font-size:11px;font-weight:800;color:#CAFF00;text-transform:uppercase;letter-spacing:0.1em;">Spike Alert</span>
          </div>

          <!-- Ticker -->
          <h1 style="margin:0 0 8px;font-size:36px;font-weight:900;color:#FFFFFF;letter-spacing:-0.03em;">
            $${esc(ticker)}
          </h1>
          <p style="margin:0 0 28px;font-size:16px;color:#A1A1AA;line-height:1.5;">
            Reddit mentions are surging right now
          </p>

          <!-- Stats -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="48%" style="background:rgba(202,255,0,0.06);border:1px solid rgba(202,255,0,0.12);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:32px;font-weight:900;color:#CAFF00;">${spikeMult}x</div>
                <div style="font-size:12px;color:#A1A1AA;margin-top:4px;">above 24h average</div>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:32px;font-weight:900;color:#FFFFFF;">${mentionCount}</div>
                <div style="font-size:12px;color:#A1A1AA;margin-top:4px;">mentions in 15 min</div>
              </td>
            </tr>
          </table>

          ${topPost ? `
          <!-- Top post -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
            <tr><td style="padding:20px;">
              <div style="font-size:11px;font-weight:700;color:#52525B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Top Post</div>
              <a href="${esc(topPost.url)}" style="font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;line-height:1.5;">${esc(topPost.title)}</a>
              <div style="margin-top:10px;">
                <a href="${esc(topPost.url)}" style="font-size:12px;font-weight:700;color:#CAFF00;text-decoration:none;">VIEW ON REDDIT &rarr;</a>
              </div>
            </td></tr>
          </table>
          ` : ''}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td>
              <a href="${stockUrl}" style="display:inline-block;padding:14px 28px;background:#CAFF00;color:#0A0A0A;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;letter-spacing:0.03em;">VIEW ${esc(ticker)} &rarr;</a>
              &nbsp;&nbsp;
              <a href="${pulseUrl}" style="display:inline-block;padding:14px 28px;background:transparent;color:#CAFF00;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;border:1px solid rgba(202,255,0,0.3);letter-spacing:0.03em;">MARKET PULSE</a>
            </td></tr>
          </table>

          <!-- Footer -->
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:#52525B;line-height:1.6;">
            This alert is based on social media mention counts, not financial advice. Always DYOR.
            <br>Manage your alerts at <a href="${alertsUrl}" style="color:#A1A1AA;">staqq.in/alerts</a>
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
