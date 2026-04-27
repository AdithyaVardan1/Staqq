const { getAllIPOs } = require('./src/lib/ipo');

async function main() {
  try {
    const ipos = await getAllIPOs();
    console.log('Slugs:', ipos.slice(0, 3).map(i => i.slug));
  } catch (e) {
    console.error('Error fetching IPOs:', e.message);
  }
}

main();
