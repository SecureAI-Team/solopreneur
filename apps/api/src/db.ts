import { createPostgresDb, createSqliteDb, sqliteSchema } from '@solomedia/database';
import * as pgSchema from '@solomedia/database';
import path from 'path';

const useSqlite = process.env.DB_TYPE === 'sqlite';

let dbInstance: any;

if (useSqlite) {
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'local.db');
    console.log(`Using SQLite Database at ${dbPath}`);
    dbInstance = createSqliteDb(dbPath);
} else {
    const connectionString = process.env.DATABASE_URL || 'postgresql://solomedia:solomedia_password_123@localhost:5432/solomedia';
    dbInstance = createPostgresDb(connectionString);
}

export const db = dbInstance;

// Export the appropriate schema based on DB type
export const schema = useSqlite ? sqliteSchema : pgSchema;

// Re-export individual tables for convenience
export const { users, contents, platformConnections, publishRecords, analytics, aiConversations, automationRules, comments, contentLearning, systemConfig, planConfig, adminLogs, research, syncedAnalytics } = schema;
