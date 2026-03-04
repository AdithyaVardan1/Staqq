import type { NewsletterContent } from '../newsletterGenerator';

function esc(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Wraps a boldPhrase inside the body text with a <strong> tag. */
function boldInText(body: string, boldPhrase: string, boldColor = '#ff4d4d'): string {
    if (!boldPhrase || !body.includes(boldPhrase)) return esc(body);
    const parts = body.split(boldPhrase);
    return (
        esc(parts[0]) +
        `<strong style="color: ${boldColor}; font-weight: 700;">${esc(boldPhrase)}</strong>` +
        esc(parts.slice(1).join(boldPhrase))
    );
}

const SUPABASE_CDN = 'https://ypwotjfqbbfndiqowqsv.supabase.co/storage/v1/object/public/newsletter-assets';
const HEADER_URL = `${SUPABASE_CDN}/header/default.png`;
const LOGO_URL = `${SUPABASE_CDN}/logo/finale.png`;

export function buildRobustNewsletter(content: NewsletterContent, weeklyHeaderUrl?: string): string {
    const {
        issueDate,
        bigPictureSummary,
        marketSummary,
        ipoNews,
        marketAlert,
        numberOfWeek,
        ipoSpotlight,
        conceptOfWeek,
        topStories,
    } = content;

    // Stories are Groq-curated from all feeds (market, regulatory, trending, IPO)
    const stories = topStories;

    // Verdict badge color
    const verdictColor = ipoSpotlight.verdict === 'Apply'
        ? '#CCFF00'
        : ipoSpotlight.verdict === 'Avoid'
            ? '#ff4d4d'
            : '#aaaaaa';
    const verdictTextColor = ipoSpotlight.verdict === 'Apply' ? '#000000' : '#ffffff';

    return `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Stack by Staqq — ${esc(issueDate)}</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Syne:wght@700;800&family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet">
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            min-width: 100%;
            background-color: #0d0d0d;
            font-family: 'DM Sans', Helvetica, Arial, sans-serif;
        }
        table { border-spacing: 0; color: #ffffff; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #0d0d0d; }
        .webkit { max-width: 800px; margin: 0 auto; }
        .outer { margin: 0 auto; width: 100%; max-width: 800px; }
        .font-syne { font-family: 'Syne', Verdana, sans-serif; }
        .font-bebas { font-family: 'Bebas Neue', Impact, sans-serif; }
        .font-archivo { font-family: 'Archivo Black', Arial Black, sans-serif; }
        .font-dm { font-family: 'DM Sans', Helvetica, Arial, sans-serif; }
        a { color: #CCFF00; text-decoration: none; }
        .text-muted { color: #888888; }
        .text-accent { color: #CCFF00; }
        .bg-card { background-color: #111111; }
        @media screen and (max-width: 600px) {
            .three-col .column { width: 100% !important; max-width: 100% !important; display: block; margin-bottom: 20px; }
            .two-col .column { width: 100% !important; max-width: 100% !important; display: block; margin-bottom: 20px; }
            .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
            .stack-title { font-size: 80px !important; letter-spacing: -2px !important; }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #0d0d0d;">
    <center class="wrapper">
        <div class="webkit">
            <table class="outer" align="center"
                style="background-color: #0d0d0d; margin: 0 auto; width: 100%; max-width: 800px; border-spacing: 0; font-family: 'DM Sans', Helvetica, Arial, sans-serif; color: #ffffff;">

                <!-- SPACER -->
                <tr>
                    <td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td>
                </tr>

                <!-- ══ HEADER IMAGE (CID inline) ══ -->
                <tr>
                    <td style="padding: 0; line-height: 0; font-size: 0;">
                        <img src="${weeklyHeaderUrl ?? HEADER_URL}"
                            alt="The Stack by Staqq"
                            width="800"
                            style="display: block; width: 100%; max-width: 800px; height: auto; border: 0; outline: none; text-decoration: none; border-radius: 16px 16px 0 0;" />
                    </td>
                </tr>

                <!-- ══ BODY CONTAINER ══ -->
                <tr>
                    <td style="padding: 0 0 40px 0; background-color: #000000; border-radius: 0 0 16px 16px;">
                        <table width="100%">

                            <!-- OPENER -->
                            <tr>
                                <td style="padding: 40px 30px 0 30px;">
                                    <p style="margin: 0 0 15px 0; font-family: 'Syne', Verdana, sans-serif; font-size: 20px; font-weight: 700; color: #ffffff;">
                                        Hey there 👋</p>
                                    <p style="margin: 0 0 0 0; font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #999999;">
                                        ${esc(bigPictureSummary || 'Here\'s your weekly dose of what matters in Indian markets. Grab a chai and let\'s dive in.')}
                                    </p>
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>

                            <!-- 🚨 MARKET ALERT -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <table width="100%"
                                        style="background-color: #111111; border: 1px solid #333333; border-radius: 12px; background-image: linear-gradient(90deg, #1a0000, #111111);">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <table width="100%">
                                                    <tr>
                                                        <td width="30" valign="top" style="font-size: 24px; line-height: 1;">🚨</td>
                                                        <td style="padding-left: 15px;">
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; color: #ff4d4d; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                                                                ${esc(marketAlert.label)}
                                                            </div>
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #cccccc;">
                                                                ${boldInText(marketAlert.body, marketAlert.boldPhrase)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>

                            <!-- 📊 NUMBER OF THE WEEK -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <!-- SECTION TITLE -->
                                    <table width="100%" style="margin-bottom: 15px;">
                                        <tr>
                                            <td width="20" style="color: #CCFF00; font-size: 16px;">📊</td>
                                            <td style="padding-left: 10px; font-family: 'Syne', Verdana, sans-serif; font-size: 12px; font-weight: 700; color: #CCFF00; letter-spacing: 2px; text-transform: uppercase;">
                                                Number of the Week
                                            </td>
                                            <td style="padding-left: 15px;">
                                                <div style="height: 1px; background-color: #222222; width: 100%;"></div>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- CARD -->
                                    <table width="100%" style="background-color: #111111; border: 1px solid #222222; border-radius: 14px;">
                                        <tr>
                                            <td style="padding: 30px;">
                                                <table width="100%">
                                                    <tr>
                                                        <td valign="middle" style="padding-right: 20px;">
                                                            <div style="font-family: 'Bebas Neue', Impact, sans-serif; font-size: 90px; color: #CCFF00; line-height: 0.9; white-space: nowrap;">
                                                                ${esc(numberOfWeek.number)}
                                                            </div>
                                                        </td>
                                                        <td valign="middle">
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 10px; font-weight: 700; color: #666666; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                                                                ${esc(numberOfWeek.subtitle)}
                                                            </div>
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 8px;">
                                                                ${esc(numberOfWeek.headline)}
                                                            </div>
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; color: #888888; line-height: 1.6;">
                                                                ${esc(numberOfWeek.detail)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>

                            <!-- ⚡ IPO SPOTLIGHT -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <!-- SECTION TITLE -->
                                    <table width="100%" style="margin-bottom: 15px;">
                                        <tr>
                                            <td width="20" style="color: #CCFF00; font-size: 16px;">⚡</td>
                                            <td style="padding-left: 10px; font-family: 'Syne', Verdana, sans-serif; font-size: 12px; font-weight: 700; color: #CCFF00; letter-spacing: 2px; text-transform: uppercase;">
                                                IPO Spotlight
                                            </td>
                                            <td style="padding-left: 15px;">
                                                <div style="height: 1px; background-color: #222222; width: 100%;"></div>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- CARD -->
                                    <table width="100%"
                                        style="background-color: #0f1205; border: 1px solid #2a3a00; border-radius: 14px; background-image: linear-gradient(135deg, #0f1a00, #0a0a0a);">
                                        <tr>
                                            <td style="padding: 30px;">
                                                <!-- HEADER -->
                                                <table width="100%" style="margin-bottom: 25px;">
                                                    <tr>
                                                        <td>
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; color: #CCFF00; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                                                                This Week's Pick
                                                            </div>
                                                            <div style="font-family: 'Archivo Black', Arial Black, sans-serif; font-size: 26px; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
                                                                ${esc(ipoSpotlight.name)}
                                                            </div>
                                                        </td>
                                                        <td align="right" valign="top">
                                                            <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 50px; padding: 4px 12px; font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #888888; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                                                ${esc(ipoSpotlight.category)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <!-- STATS GRID -->
                                                <table width="100%" style="margin-bottom: 25px;">
                                                    <tr>
                                                        <td width="25%" valign="top">
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Price</div>
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #ffffff;">${esc(ipoSpotlight.price)}</div>
                                                        </td>
                                                        <td width="25%" valign="top">
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">GMP</div>
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #CCFF00;">${esc(ipoSpotlight.gmp)}</div>
                                                        </td>
                                                        <td width="25%" valign="top">
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Est.</div>
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #CCFF00;">${esc(ipoSpotlight.estimated)}</div>
                                                        </td>
                                                        <td width="25%" valign="top">
                                                            <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Close</div>
                                                            <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #ffffff;">${esc(ipoSpotlight.closeDate)}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <!-- VERDICT -->
                                                <table width="100%" style="border-top: 1px solid #1e2e00; padding-top: 20px;">
                                                    <tr>
                                                        <td width="120" valign="middle">
                                                            <a href="https://staqq.in/ipo" style="text-decoration: none; display: inline-block;">
                                                                <div style="background-color: ${verdictColor}; color: ${verdictTextColor}; font-family: 'Archivo Black', Arial Black, sans-serif; font-size: 12px; padding: 10px 24px; border-radius: 50px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer;">
                                                                    ${ipoSpotlight.verdict === 'Apply' ? '✓' : ipoSpotlight.verdict === 'Avoid' ? '✗' : '~'} ${esc(ipoSpotlight.verdict)}
                                                                </div>
                                                            </a>
                                                        </td>
                                                        <td align="right" valign="bottom" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; color: #888888; line-height: 1.7; padding-left: 20px;">
                                                            <div style="font-style: normal; color: #888888; text-align: right;">${esc(ipoSpotlight.description)}</div>
                                                            <div style="font-style: italic; text-align: right;">${esc(ipoSpotlight.note)}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>

                            <!-- 📰 STORIES WORTH YOUR TIME -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <!-- SECTION TITLE -->
                                    <table width="100%" style="margin-bottom: 15px;">
                                        <tr>
                                            <td width="20" style="color: #CCFF00; font-size: 16px;">📰</td>
                                            <td style="padding-left: 10px; font-family: 'Syne', Verdana, sans-serif; font-size: 12px; font-weight: 700; color: #CCFF00; letter-spacing: 2px; text-transform: uppercase;">
                                                Stories worth your time
                                            </td>
                                            <td style="padding-left: 15px;">
                                                <div style="height: 1px; background-color: #222222; width: 100%;"></div>
                                            </td>
                                        </tr>
                                    </table>
                                    ${stories.map((story, i) => `
                                    <!-- STORY ${i + 1} -->
                                    <table width="100%"
                                        style="margin-bottom: 20px; background-color: #111111; border: 1px solid #1e1e1e; border-radius: 12px;">
                                        <tr>
                                            <td width="50" align="center"
                                                style="background-color: #CCFF00; font-family: 'Bebas Neue', Impact, sans-serif; font-size: 28px; color: #000000; border-radius: 12px 0 0 12px;">
                                                ${i + 1}
                                            </td>
                                            <td style="padding: 16px 20px;">
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; color: #CCFF00; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                                                    Latest News
                                                </div>
                                                <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; line-height: 1.4; margin-bottom: 8px;">
                                                    ${esc(story.title)}
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 13px; color: #888888; line-height: 1.5; margin-bottom: 8px;">
                                                    ${esc(story.content)}
                                                </div>
                                                ${story.url ? `<a href="${esc(story.url)}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #CCFF00; text-decoration: none; letter-spacing: 0.5px;">Read Story →</a>` : ''}
                                            </td>
                                        </tr>
                                    </table>`).join('')}
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>

                            <!-- 💡 CONCEPT OF THE WEEK -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <!-- SECTION TITLE -->
                                    <table width="100%" style="margin-bottom: 15px;">
                                        <tr>
                                            <td width="20" style="color: #CCFF00; font-size: 16px;">💡</td>
                                            <td style="padding-left: 10px; font-family: 'Syne', Verdana, sans-serif; font-size: 12px; font-weight: 700; color: #CCFF00; letter-spacing: 2px; text-transform: uppercase;">
                                                Concept of the week
                                            </td>
                                            <td style="padding-left: 15px;">
                                                <div style="height: 1px; background-color: #222222; width: 100%;"></div>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- CARD -->
                                    <table width="100%"
                                        style="background-color: #0e0e0e; border: 1px solid #1e1e1e; border-left: 3px solid #CCFF00; border-radius: 0 12px 12px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <div style="font-family: 'Archivo Black', Arial Black, sans-serif; font-size: 22px; color: #CCFF00; margin-bottom: 6px; text-transform: uppercase; letter-spacing: -0.5px;">
                                                    ${esc(conceptOfWeek.term)}
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 700; color: #555555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                                                    ${esc(conceptOfWeek.subtitle)}
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 14px; color: #888888; line-height: 1.7;">
                                                    ${esc(conceptOfWeek.body)}
                                                </div>
                                                <div style="margin-top: 15px;">
                                                    <a href="https://staqq.in/learn"
                                                        style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; color: #CCFF00; text-decoration: none; letter-spacing: 0.5px;">Learn
                                                        more in the Staqq Learn Hub →</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- SPACER -->
                            <tr><td height="50" style="font-size: 50px; line-height: 50px;">&nbsp;</td></tr>

                            <!-- FOOTER -->
                            <tr>
                                <td style="padding: 0 30px; border-top: 1px solid #1a1a1a;">
                                    <table width="100%">
                                        <tr>
                                            <td style="padding: 30px 0;">
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666; line-height: 1.6; margin-bottom: 20px;">
                                                    That's your stack for this week. If this was useful, forward it to
                                                    one friend who's trying to figure out markets — that's the best
                                                    support you can give us right now. Questions? Just hit reply.
                                                </div>
                                                <div style="font-family: 'Syne', Verdana, sans-serif; font-size: 24px; font-weight: 800; color: #CCFF00; margin-bottom: 4px; letter-spacing: -0.5px;">
                                                    Stay sharp 🚀
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; color: #444444;">
                                                    — The Staqq Team
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 40px; text-align: center;">
                                                <div style="margin-bottom: 8px;">
                                                    <img src="${LOGO_URL}" alt="STAQQ" width="120" style="display: inline-block; border: 0; height: auto;" />
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #666666; margin-bottom: 20px; letter-spacing: 0.5px;">
                                                    The financial stack for Gen Z · staqq.in
                                                </div>
                                                <div style="margin-bottom: 20px;">
                                                    <a href="https://staqq.in/ipo" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #555555; text-decoration: none; margin: 0 10px;">IPO Hub</a>
                                                    <a href="https://staqq.in/stocks" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #555555; text-decoration: none; margin: 0 10px;">Stocks</a>
                                                    <a href="https://staqq.in/pulse" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #555555; text-decoration: none; margin: 0 10px;">Market Pulse</a>
                                                    <a href="https://staqq.in/learn" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #555555; text-decoration: none; margin: 0 10px;">Learn Hub</a>
                                                    <a href="#" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 11px; color: #555555; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
                                                </div>
                                                <div style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 10px; color: #666666; line-height: 1.7; max-width: 480px; margin: 0 auto;">
                                                    Disclaimer: Content is for educational purposes only, not investment advice. Staqq is not a SEBI-registered advisor. Do your own research before investing. Investments carry risk, including loss of capital.
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>

</html>`;
}
