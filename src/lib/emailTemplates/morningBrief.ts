// ─── Morning Brief Email Template ───────────────────────────────────
// Builds a complete HTML email for the daily morning brief.
// Uses inline CSS only for maximum email client compatibility.
// ─────────────────────────────────────────────────────────────────────

import type { MorningBrief } from '@/lib/morningBrief';

function esc(str: string | null | undefined): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function netColor(val: number): string {
    return val >= 0 ? '#22C55E' : '#EF4444';
}

function formatNet(val: number): string {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(0)} Cr`;
}

export function buildMorningBriefEmail(brief: MorningBrief): string {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://staqq.in';

    // ─── Market Overview Section ────────────────────────────────────
    const marketSection = brief.marketOverview
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-bottom:12px;">
                <div style="font-size:11px;font-weight:700;color:#52525B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Market Overview</div>
              </td>
            </tr>
            <tr>
              <td width="48%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;vertical-align:top;">
                <div style="font-size:12px;color:#A1A1AA;margin-bottom:6px;">FII Net</div>
                <div style="font-size:28px;font-weight:900;color:${netColor(brief.marketOverview.fiiNet)};">${formatNet(brief.marketOverview.fiiNet)}</div>
                <div style="font-size:11px;color:#52525B;margin-top:8px;">Buy ${brief.marketOverview.fiiBuy.toFixed(0)} | Sell ${brief.marketOverview.fiiSell.toFixed(0)}</div>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;text-align:center;vertical-align:top;">
                <div style="font-size:12px;color:#A1A1AA;margin-bottom:6px;">DII Net</div>
                <div style="font-size:28px;font-weight:900;color:${netColor(brief.marketOverview.diiNet)};">${formatNet(brief.marketOverview.diiNet)}</div>
                <div style="font-size:11px;color:#52525B;margin-top:8px;">Buy ${brief.marketOverview.diiBuy.toFixed(0)} | Sell ${brief.marketOverview.diiSell.toFixed(0)}</div>
              </td>
            </tr>
          </table>`
        : '';

    // ─── Spike Alerts Section ───────────────────────────────────────
    const spikeSection = brief.spikesLast24h.length > 0
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:rgba(202,255,0,0.04);border:1px solid rgba(202,255,0,0.12);border-radius:12px;">
            <tr><td style="padding:20px;">
              <div style="font-size:11px;font-weight:700;color:#CAFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Spike Alerts (24h)</div>
              ${brief.spikesLast24h.map(s => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:14px;font-weight:700;color:#FFFFFF;">${esc(s.ticker)}</span>
                <span style="font-size:14px;color:#CAFF00;font-weight:700;">${s.multiplier}x</span>
                <span style="font-size:12px;color:#A1A1AA;">${s.mentions} mentions</span>
              </div>`).join('')}
            </td></tr>
          </table>`
        : '';

    // ─── IPO Updates Section ────────────────────────────────────────
    const ipoSection = brief.ipoUpdates.length > 0
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td>
              <div style="font-size:11px;font-weight:700;color:#52525B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">IPO Updates</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                ${brief.ipoUpdates.map(ipo => `
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:14px;font-weight:600;color:#FFFFFF;">${esc(ipo.name)}</div>
                    <div style="font-size:12px;color:#A1A1AA;margin-top:2px;">${esc(ipo.status)}</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
                    <div style="font-size:14px;font-weight:700;color:#CAFF00;">GMP: ${esc(ipo.gmp)}</div>
                  </td>
                </tr>`).join('')}
              </table>
            </td></tr>
          </table>`
        : '';

    // ─── Insider Trades Section ─────────────────────────────────────
    const insiderSection = brief.topInsiderTrades.length > 0
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td>
              <div style="font-size:11px;font-weight:700;color:#52525B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Insider Trades</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                ${brief.topInsiderTrades.map(t => `
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:14px;font-weight:600;color:#FFFFFF;">${esc(t.company)}</div>
                    <div style="font-size:12px;color:#A1A1AA;margin-top:2px;">${esc(t.person)} &middot; ${esc(t.type)}</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;white-space:nowrap;">
                    <div style="font-size:13px;font-weight:600;color:#FFFFFF;">${esc(t.value)}</div>
                  </td>
                </tr>`).join('')}
              </table>
            </td></tr>
          </table>`
        : '';

    // ─── Bulk Deals Section ─────────────────────────────────────────
    const bulkSection = brief.topBulkDeals.length > 0
        ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td>
              <div style="font-size:11px;font-weight:700;color:#52525B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Bulk &amp; Block Deals</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                ${brief.topBulkDeals.map(d => `
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:14px;font-weight:600;color:#FFFFFF;">${esc(d.company)}</div>
                    <div style="font-size:12px;color:#A1A1AA;margin-top:2px;">${esc(d.client)}</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;color:${d.type === 'BUY' ? '#22C55E' : '#EF4444'};background:${d.type === 'BUY' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'};">${esc(d.type)}</span>
                    <div style="font-size:13px;font-weight:600;color:#FFFFFF;margin-top:4px;">${esc(d.value)}</div>
                  </td>
                </tr>`).join('')}
              </table>
            </td></tr>
          </table>`
        : '';

    // ─── Assemble Email ─────────────────────────────────────────────
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staqq Morning Brief</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid rgba(202,255,0,0.15);overflow:hidden;">

        <!-- Accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#0A0A0A,#CAFF00 30%,#CAFF00 70%,#0A0A0A);"></td></tr>

        <tr><td style="padding:36px 40px;">

          <!-- Header -->
          <div style="font-size:28px;font-weight:900;color:#FFFFFF;margin-bottom:4px;letter-spacing:-0.03em;">
            Good Morning &#9728;&#65039;
          </div>
          <div style="font-size:14px;color:#A1A1AA;margin-bottom:32px;">
            ${esc(brief.date)}
          </div>

          ${marketSection}
          ${spikeSection}
          ${ipoSection}
          ${insiderSection}
          ${bulkSection}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center">
              <a href="${APP_URL}" style="display:inline-block;padding:14px 32px;background:#CAFF00;color:#0A0A0A;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;letter-spacing:0.03em;">OPEN STAQQ TERMINAL &rarr;</a>
            </td></tr>
          </table>

          <!-- Footer -->
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:#52525B;line-height:1.6;">
            Your daily morning brief from <a href="${APP_URL}" style="color:#A1A1AA;text-decoration:none;">Staqq</a>.
            This is not financial advice. Always DYOR.
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
