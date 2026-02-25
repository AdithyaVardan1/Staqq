/**
 * generateHeader.ts
 *
 * Composite approach (fully font-agnostic for STACK):
 *  1. Sharp creates a 1084×286 neon yellow (#CCFF00) base with rounded corners
 *  2. header_1.png (pixel-perfect STACK logo, 1084×229) is composited shifted
 *     right by SHIFT px — exposing a yellow strip on the left for the issue label
 *  3. An SVG overlay adds dynamic text elements (Arial only — always reliable):
 *     • Rotated "ISSUE XX · MON YYYY" in the left yellow strip
 *     • "BY STAQQ" bottom-left
 *     • Date pill bottom-right: "DAY, DD MON YYYY"
 */

import * as fs from 'fs';
import * as path from 'path';

export interface HeaderOptions {
  issueNumber: number;
  date?: Date;
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const W = 1200;  // canvas width
const H = 365; // canvas height (adds ~57px below the 229px logo)
const RADIUS = 22;   // corner radius
const SHIFT = 45;    // px to shift header_1.png right, exposing a yellow strip

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatIssueLabel(n: number, d: Date): string {
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `ISSUE ${String(n).padStart(2, '0')} \u00b7 ${month} ${d.getFullYear()}`;
}

function formatDateBadge(d: Date): string {
  return d
    .toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

function buildBaseSVG(): Buffer {
  return Buffer.from(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect x="0" y="0" width="${W}" height="${H}" rx="${RADIUS}" ry="${RADIUS}" fill="#CCFF00"/>` +
    `</svg>`
  );
}

function buildOverlaySVG(issueLabel: string, dateBadge: string): Buffer {
  const pillW = 200;
  const pillH = 30;
  const pillX = W - pillW - 20;
  const pillY = H - pillH - 70;
  const pillCx = pillX + pillW / 2;
  const pillCy = pillY + pillH / 2 + 1;

  // Rotated label sits in the SHIFT-wide yellow strip exposed on the left
  const rotX = 30;
  const rotY = 205;

  return Buffer.from(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">` +

    // Issue label — rotated -90deg, reads bottom-to-top
    `<text x="${rotX}" y="${rotY}" transform="rotate(-90, ${rotX}, ${rotY})"` +
    ` font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="500"` +
    ` letter-spacing="3" fill="rgba(0,0,0,0.45)" text-anchor="start" dominant-baseline="middle"` +
    `>${issueLabel}</text>` +

    // BY STAQQ bottom-left (just after the exposed strip)
    `<text x="${SHIFT + 12}" y="${H - 70}"` +
    ` font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="500"` +
    ` letter-spacing="3" fill="rgba(0,0,0,0.45)">BY STAQQ</text>` +

    // Date pill
    `<rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}"` +
    ` rx="${pillH / 2}" ry="${pillH / 2}" fill="#000000"/>` +
    `<text x="${pillCx}" y="${pillCy}"` +
    ` font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700"` +
    ` letter-spacing="2.5" fill="#CCFF00" text-anchor="middle" dominant-baseline="middle"` +
    `>${dateBadge}</text>` +

    `</svg>`
  );
}


// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateHeaderImage(options: HeaderOptions): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  const date = options.date ?? new Date();
  const issueLabel = formatIssueLabel(options.issueNumber, date);
  const dateBadge = formatDateBadge(date);

  const header1Path = path.join(process.cwd(), 'public', 'newsletter', 'header_1.png');

  // Resize header_1.png to (W - SHIFT) wide so it fits after the horizontal shift
  const resizedLogo = await sharp(header1Path)
    .resize(W - SHIFT, null, { fit: 'contain', background: '#CCFF00' })
    .png()
    .toBuffer();

  return sharp(buildBaseSVG())
    .composite([
      // Logo shifted right — now fits exactly within the canvas
      { input: resizedLogo, top: 35, left: SHIFT },
      // Dynamic text overlay
      { input: buildOverlaySVG(issueLabel, dateBadge), top: 35, left: 0 },
    ])
    .png()
    .toBuffer();
}
