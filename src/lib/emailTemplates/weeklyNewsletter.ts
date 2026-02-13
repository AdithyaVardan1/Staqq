import type { NewsletterContent } from '../newsletterGenerator';
import type { NewsArticle } from '../tavily';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(text: string, maxLen = 200): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '...';
}

function renderArticleCard(article: NewsArticle, index: number): string {
  return `
    <tr>
      <td style="padding: 0 0 16px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(202,255,0,0.04), rgba(202,255,0,0.01)); border: 1px solid rgba(202,255,0,0.1); border-radius: 12px;">
          <tr>
            <td style="padding: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width: 40px; vertical-align: top; padding-right: 16px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #CAFF00, #8ABF00); text-align: center; line-height: 36px; font-size: 15px; font-weight: 800; color: #0A0A0A;">${index + 1}</div>
                  </td>
                  <td>
                    <a href="${escapeHtml(article.url)}" style="color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; line-height: 1.4;">${escapeHtml(article.title)}</a>
                    <p style="color: #A1A1AA; font-size: 13px; line-height: 1.6; margin: 8px 0 0;">${escapeHtml(article.content)}</p>
                    <a href="${escapeHtml(article.url)}" style="display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600; color: #CAFF00; text-decoration: none; letter-spacing: 0.03em;">READ MORE →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderSection(emoji: string, title: string, articles: NewsArticle[]): string {
  if (!articles.length) return '';

  return `
    <!-- ${title} Section -->
    <tr>
      <td style="padding: 36px 40px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">${emoji}</span>
                    <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em; vertical-align: middle;">${escapeHtml(title)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px;">
                    <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #CAFF00, transparent); border-radius: 2px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${articles.map((a, i) => renderArticleCard(a, i)).join('')}
        </table>
      </td>
    </tr>`;
}

export function buildWeeklyNewsletter(content: NewsletterContent, recipientEmail: string): string {
  const { issueDate, bigPictureSummary, marketSummary, ipoNews, trendingStocks, regulatoryNews, financialInsight } = content;

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>The Stack by Staqq — ${escapeHtml(issueDate)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .header-padding { padding: 32px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #0A0A0A;">
    Your weekly edge in Indian markets — The Stack by Staqq
  </div>

  <!-- Full-width email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0A0A0A;">
    <tr>
      <td align="center" style="padding: 0;">

        <!-- Main container — full width -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0E0E0E;">

          <!-- Neon top accent bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #0A0A0A, #CAFF00 30%, #CAFF00 70%, #0A0A0A);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="header-padding" style="background: linear-gradient(180deg, #0E1A00 0%, #0E0E0E 100%); padding: 48px 40px; text-align: center;">
              <!-- Logo mark -->
              <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #CAFF00, #8ABF00); text-align: center; line-height: 48px; font-size: 22px; margin-bottom: 16px;">📊</div>
              <h1 style="margin: 0 0 6px; font-size: 32px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.04em;">
                THE STACK
              </h1>
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #CAFF00; letter-spacing: 0.2em; text-transform: uppercase;">BY STAQQ</p>
              <div style="height: 1px; width: 80px; background: rgba(202,255,0,0.3); margin: 16px auto;"></div>
              <p style="margin: 0; font-size: 15px; color: #A1A1AA; font-weight: 400;">Your weekly edge in Indian markets</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #52525B;">${escapeHtml(issueDate)}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="content-padding" style="padding: 36px 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(202,255,0,0.06), rgba(202,255,0,0.02)); border: 1px solid rgba(202,255,0,0.08); border-radius: 14px;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 700;">Hey there 👋</p>
                    <p style="margin: 10px 0 0; font-size: 14px; color: #A1A1AA; line-height: 1.7;">
                      Here's your weekly dose of what matters in Indian markets. Grab a chai and let's dive in.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- THE BIG PICTURE with overview -->
          ${marketSummary.articles.length > 0 ? `
          <tr>
            <td style="padding: 36px 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📈</span>
                          <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em; vertical-align: middle;">THE BIG PICTURE</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px;">
                          <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #CAFF00, transparent); border-radius: 2px;"></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${bigPictureSummary ? `
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(202,255,0,0.06), rgba(202,255,0,0.02)); border: 1px solid rgba(202,255,0,0.12); border-radius: 12px;">
                      <tr>
                        <td style="padding: 18px 22px;">
                          <p style="margin: 0; font-size: 14px; color: #D4D4D8; line-height: 1.7; font-style: italic;">${escapeHtml(bigPictureSummary)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                ${marketSummary.articles.map((a, i) => renderArticleCard(a, i)).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${renderSection('🚨', 'IPO ALERTS', ipoNews.articles)}

          ${renderSection('📱', "WHAT'S TRENDING", trendingStocks.articles)}

          <!-- Learn Section (CTA) -->
          <tr>
            <td class="content-padding" style="padding: 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(202,255,0,0.1), rgba(202,255,0,0.03)); border-radius: 16px; border: 1px solid rgba(202,255,0,0.2); overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <div style="display: inline-block; width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #CAFF00, #8ABF00); text-align: center; line-height: 36px; font-size: 18px; margin-bottom: 12px;">📚</div>
                          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 800; color: #CAFF00; text-transform: uppercase; letter-spacing: 0.15em;">LEARN THIS WEEK</p>
                          <p style="margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">Continue your investing journey on Staqq</p>
                          <p style="margin: 0 0 20px; font-size: 14px; color: #A1A1AA; line-height: 1.6;">
                            Master the market in 5 minutes a day with gamified lessons — no jargon, just clarity.
                          </p>
                          <a href="https://staqq.in/learn" style="display: inline-block; padding: 12px 28px; background: #CAFF00; color: #0A0A0A; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 10px; letter-spacing: 0.03em;">START LEARNING →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${renderSection('📰', 'QUICK HITS', regulatoryNews.articles)}

          ${financialInsight.articles.length > 0 ? renderSection('💡', 'INSIGHTS & TIPS', financialInsight.articles) : ''}

          <!-- Divider -->
          <tr>
            <td style="padding: 16px 40px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(202,255,0,0.15), transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px 48px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #A1A1AA;">
                That's it for this week! Questions? Just hit reply.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #FFFFFF; font-weight: 700;">
                Stay sharp 🚀
              </p>
              <div style="height: 1px; width: 120px; background: rgba(202,255,0,0.2); margin: 0 auto 24px;"></div>
              <p style="margin: 0; font-size: 11px; color: #52525B;">
                <a href="https://staqq.in" style="color: #CAFF00; text-decoration: none; font-weight: 600;">VIEW IN BROWSER</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://staqq.in/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #52525B; text-decoration: none;">UNSUBSCRIBE</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #3F3F46;">
                Staqq · Making investing less intimidating<br>
                staqq.in · hello@staqq.in
              </p>
            </td>
          </tr>

          <!-- Neon bottom accent bar -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #0A0A0A, #CAFF00 30%, #CAFF00 70%, #0A0A0A);"></td>
          </tr>

        </table>
        <!-- /Main container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
