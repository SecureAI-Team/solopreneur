
import chalk from 'chalk';

/**
 * SoloMedia Mock Load Testing Script
 * Usage: npx tsx scripts/load_test.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const CONCURRENT_USERS = 50;
const DURATION_SECONDS = 10;

console.log(chalk.blue.bold(`🚀 Starting SoloMedia Load Test`));
console.log(chalk.gray(`Target: ${BASE_URL}`));
console.log(chalk.gray(`Users: ${CONCURRENT_USERS}`));
console.log(chalk.gray(`Duration: ${DURATION_SECONDS}s`));

interface Stats {
    requests: number;
    success: number;
    failed: number;
    totalLatency: number;
}

const stats: Stats = {
    requests: 0,
    success: 0,
    failed: 0,
    totalLatency: 0
};

async function simulateUser(id: number) {
    const start = Date.now();
    const end = start + DURATION_SECONDS * 1000;

    while (Date.now() < end) {
        const reqStart = Date.now();
        try {
            // Pick a random endpoint to hit
            const endpoints = [
                '/auth/check', // Mock auth check (assuming 401 if not logged in, but counts as traffic)
                '/analytics/trend?days=7', // Analytics (Cached?)
                '/', // Health check
            ];
            const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

            const res = await fetch(`${BASE_URL}${endpoint}`);
            stats.requests++;
            if (res.ok || res.status === 401) { // 401 is expected for unauth users
                stats.success++;
            } else {
                stats.failed++;
            }
        } catch (e) {
            stats.failed++;
        }

        stats.totalLatency += (Date.now() - reqStart);

        // Random think time (50-200ms)
        await new Promise(r => setTimeout(r, 50 + Math.random() * 150));
    }
}

async function run() {
    const promises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(simulateUser(i));
    }

    await Promise.all(promises);

    console.log(chalk.green.bold(`\n✅ Load Test Complete!`));
    console.log(`Total Requests: ${stats.requests}`);
    console.log(`Avg RPS: ${(stats.requests / DURATION_SECONDS).toFixed(2)}`);
    console.log(`Success Rate: ${((stats.success / stats.requests) * 100).toFixed(2)}%`);
    console.log(`Avg Latency: ${(stats.totalLatency / stats.requests).toFixed(2)}ms`);

    if (stats.failed > 0) {
        console.log(chalk.red(`Failed Requests: ${stats.failed}`));
    }
}

run().catch(console.error);
