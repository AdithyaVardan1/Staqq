require('dotenv').config({ path: '.env.local' });
const { AngelOneService } = require('../src/lib/angelone');

async function main() {
    console.log('--- Angel One Session Init ---');
    const angel = AngelOneService.getInstance();
    
    console.log('Attempting authentication...');
    const success = await angel.refreshSession();
    
    if (success) {
        console.log('SUCCESS: Session initialized and stored in Redis.');
    } else {
        console.log('FAILURE: Could not authenticate with Angel One. Check your .env.local credentials.');
    }
    process.exit(0);
}

main().catch(err => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});
