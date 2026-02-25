const fs = require('fs');
const path = require('path');

// Read the header image and convert to base64
const headerPath = path.join(__dirname, 'public', 'newsletter', 'header.png');
const headerBase64 = fs.readFileSync(headerPath).toString('base64');
const dataUri = `data:image/png;base64,${headerBase64}`;

// Read newsletter-robust.html
const htmlPath = path.join(__dirname, 'newsletter-robust.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// The image tag to replace the masthead table with
const imgTag = `<tr>
                    <td style="padding: 0; line-height: 0; font-size: 0;">
                        <img src="${dataUri}" alt="The Stack by Staqq" width="800" style="display: block; width: 100%; max-width: 800px; height: auto; border: 0; outline: none; text-decoration: none; border-radius: 16px 16px 0 0;" />
                    </td>
                </tr>`;

// Replace the masthead <tr> block (from <!-- ══ MASTHEAD --> to the closing </tr> after </table></td></tr>)
const mastheadStart = html.indexOf('<!-- ══ MASTHEAD');
const mastheadEnd = html.indexOf('<!-- ══ BODY CONTAINER ══ -->');

if (mastheadStart === -1 || mastheadEnd === -1) {
    console.error('Could not find masthead markers');
    console.log('mastheadStart:', mastheadStart, 'mastheadEnd:', mastheadEnd);
    process.exit(1);
}

const before = html.slice(0, mastheadStart);
const after = html.slice(mastheadEnd);

const newHtml = before + imgTag + '\n\n                ' + after;
fs.writeFileSync(htmlPath, newHtml, 'utf-8');
console.log('Done! newsletter-robust.html updated with embedded header image.');
console.log('Base64 length:', headerBase64.length, 'chars');
