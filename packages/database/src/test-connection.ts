
import { createDb } from './index';
import { sql } from 'drizzle-orm';

async function main() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://solomedia:solomedia_password_123@localhost:5432/solomedia';
    console.log('Connecting to database...');

    try {
        const db = createDb(connectionString);

        // Execute a simple query
        const result = await db.execute(sql`SELECT NOW()`);

        console.log('✅ Database connection successful!');
        console.log('Server time:', result[0].now);

        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

main();
