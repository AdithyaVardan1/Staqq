const fs = require('fs');
const path = require('path');

const CHAPTERS_DIR = path.join(__dirname, '../src/chapters');

function convertTableBuffer(buffer) {
    if (buffer.length < 2) return buffer.join('\n'); // Not a valid table

    // Buffer[0] is header
    // Buffer[1] is separator (ignore)
    // Buffer[2+] is body

    const headerLine = buffer[0];
    const bodyLines = buffer.slice(2);

    // Parse Headers
    let hLine = headerLine.trim();
    if (hLine.startsWith('|')) hLine = hLine.substring(1);
    if (hLine.endsWith('|')) hLine = hLine.substring(0, hLine.length - 1);
    const headers = hLine.split('|').map(h => h.trim().replace(/"/g, '&quot;'));

    // Parse Body
    const rows = bodyLines.map(rowLine => {
        let line = rowLine.trim();
        if (line.startsWith('|')) line = line.substring(1);
        if (line.endsWith('|')) line = line.substring(0, line.length - 1);
        return line.split('|').map(c => c.trim().replace(/"/g, '&quot;'));
    });

    const headerJson = JSON.stringify(headers);
    const rowsString = rows.map(row => `    [${row.map(c => `"${c}"`).join(', ')}]`).join(',\n');

    return `<Table \n  headers={${headerJson}}\n  rows={[\n${rowsString}\n  ]}\n/>`;
}

function processContent(content) {
    const lines = content.split(/\r?\n/);
    let newLines = [];
    let inTable = false;
    let tableBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if line looks like a table row | ... |
        // Markdown tables allow leading spaces.
        const isTableLine = trimmed.startsWith('|') && (trimmed.endsWith('|') || trimmed.split('|').length > 1);

        if (isTableLine) {
            if (!inTable) {
                // Check if next line is a separator to confirm start of table
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    // Separator must contain only | - : and whitespace
                    if (/^\|[\s\-:|]+\|?$/.test(nextLine)) {
                        inTable = true;
                        tableBuffer.push(line);
                        continue;
                    }
                }
            } else {
                tableBuffer.push(line);
                continue;
            }
        }

        if (inTable) {
            // End of table detected (current line is not a table line)
            newLines.push(convertTableBuffer(tableBuffer));
            inTable = false;
            tableBuffer = [];
        }

        newLines.push(line);
    }

    // Flush remaining table if file ends
    if (inTable) {
        newLines.push(convertTableBuffer(tableBuffer));
    }

    return newLines.join('\n');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.mdx')) {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Skip if no table chars or already has <Table
            // We want to re-run even if <Table exists because we might have mixed content, 
            // but for efficiency we can skip if no | 
            if (!content.includes('|')) continue;

            const newContent = processContent(content);
            if (newContent !== content) {
                console.log(`Converted tables in ${fullPath}`);
                fs.writeFileSync(fullPath, newContent);
            }
        }
    }
}

console.log('Starting table conversion with line parser...');
processDirectory(CHAPTERS_DIR);
console.log('Conversion complete.');
