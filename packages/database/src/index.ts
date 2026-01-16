import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as sqliteSchema from './schema/sqlite';

export * from './schema';
export { sqliteSchema };

// 创建 Postgres 数据库连接
export function createPostgresDb(connectionString: string) {
    const client = postgres(connectionString);
    return drizzlePg(client, { schema });
}

// 创建 SQLite 数据库连接
export function createSqliteDb(path: string) {
    const sqlite = new Database(path);
    return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

export type PostgresDb = ReturnType<typeof createPostgresDb>;
export type SqliteDb = ReturnType<typeof createSqliteDb>;
// Union type for general use if schemas align enough (dangerous but pragmatic)
export type DrizzleDb = PostgresDb | SqliteDb;

