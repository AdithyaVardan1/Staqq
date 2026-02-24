const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// The SVG uses embedded system fonts that render well cross-platform.
// We embed the styling directly to match the reference design as closely as possible.
const svgContent = `<svg width="780" height="240" viewBox="0 0 780 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="roundTop">
      <rect x="0" y="0" width="780" height="240" rx="16" ry="16"/>
    </clipPath>
    <style>
      @font-face {
        font-family: 'Impact';
        src: local('Impact');
      }
    </style>
  </defs>

  <!-- Background -->
  <rect x="0" y="0" width="780" height="240" rx="16" ry="16" fill="#CCFF00"/>

  <!-- Issue badge — rotated vertical text on the left -->
  <text
    x="20"
    y="185"
    transform="rotate(-90, 20, 185)"
    font-family="Arial, Helvetica, sans-serif"
    font-size="10"
    font-weight="500"
    letter-spacing="2.5"
    fill="rgba(0,0,0,0.45)"
    text-anchor="start"
    dominant-baseline="auto"
  >ISSUE 01 · FEB 2026</text>

  <!-- "THE" label -->
  <text
    x="50"
    y="80"
    font-family="Impact, Arial Black, sans-serif"
    font-size="40"
    font-style="normal"
    font-weight="900"
    letter-spacing="4"
    fill="rgba(0,0,0,0.5)"
  >THE</text>

  <!-- "STACK" — massive headline -->
  <text
    x="44"
    y="185"
    font-family="Impact, Arial Black, 'Franklin Gothic Heavy', sans-serif"
    font-size="145"
    font-weight="900"
    letter-spacing="-6"
    fill="#000000"
    dominant-baseline="auto"
  >STACK</text>

  <!-- "BY STAQQ" bottom-left -->
  <text
    x="50"
    y="226"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="500"
    letter-spacing="2"
    fill="rgba(0,0,0,0.45)"
    text-transform="uppercase"
  >BY STAQQ</text>

  <!-- Date badge background (pill) -->
  <rect x="574" y="210" width="182" height="24" rx="12" ry="12" fill="#000000"/>

  <!-- Date badge text -->
  <text
    x="665"
    y="226"
    font-family="Arial, Helvetica, sans-serif"
    font-size="10.5"
    font-weight="600"
    letter-spacing="1.8"
    fill="#CCFF00"
    text-anchor="middle"
  >WED, 12 FEB 2026</text>
</svg>`;

const outputDir = path.join(__dirname, 'public', 'newsletter');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'header.png');

sharp(Buffer.from(svgContent))
    .png()
    .toFile(outputPath)
    .then(info => {
        console.log('Header image created successfully:', outputPath);
        console.log('Info:', JSON.stringify(info));
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
