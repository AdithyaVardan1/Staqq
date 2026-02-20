const Redis = require('ioredis');

// Connect to Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

const ACTIVE_USERS_KEY = 'global:active_users';

async function listSessions() {
    console.log('\n🔍  Scanning Active Sessions...\n');

    try {
        const now = Date.now();
        // Get all users from the Sorted Set (0 to -1 means all)
        // usage: AESC (oldest first) or DESC (newest first). We want recent first.
        const users = await redis.zrevrange(ACTIVE_USERS_KEY, 0, -1, 'WITHSCORES');

        // users array is [userId1, score1, userId2, score2, ...]

        let count = 0;
        console.log('--------------------------------------------------');
        console.log(`| ${'User ID'.padEnd(30)} | ${'Last Active'.padEnd(15)} |`);
        console.log('--------------------------------------------------');

        for (let i = 0; i < users.length; i += 2) {
            const userId = users[i];
            const timestamp = parseInt(users[i + 1]);
            const date = new Date(timestamp);

            // Calculate minutes age
            const minutesAgo = ((now - timestamp) / 1000 / 60).toFixed(1);
            const timeString = `${minutesAgo}m ago`;

            console.log(`| ${userId.padEnd(30)} | ${timeString.padEnd(15)} |`);

            // Fetch session data details
            const sessionData = await redis.hgetall(`session:${userId}`);
            if (Object.keys(sessionData).length > 0) {
                console.log(`  └─ Data: ${JSON.stringify(sessionData)}`);
            }
            count++;
        }

        if (count === 0) {
            console.log('| No active sessions found.');
        }

        console.log('--------------------------------------------------');
        console.log(`Total Active Users (tracked): ${count}\n`);

    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error('\n❌  Error: Could not connect to Redis at ' + redisUrl);
            console.error('    Please ensure Redis server is running locally on port 6379.');
        } else {
            console.error('Error fetching sessions:', err);
        }
    } finally {
        redis.disconnect();
    }
}

listSessions();
