import { createDb } from '@solomedia/database';

const connectionString = process.env.DATABASE_URL || 'postgresql://solomedia:solomedia_password_123@localhost:5432/solomedia';

export const db = createDb(connectionString);
