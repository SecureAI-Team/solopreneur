import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

// 创建数据库连接
export function createDb(connectionString: string) {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
