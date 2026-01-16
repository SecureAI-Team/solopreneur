import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { contentRoutes } from './routes/content';
import { analyticsRoutes } from './routes/analytics';
import { aiRoutes } from './routes/ai';
import { uploadRoutes } from './routes/upload';
import { platformRoutes } from './routes/platform';
import { commentRoutes } from './routes/comments';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors({
    origin: ['http://localhost:3000', 'https://servicewechat.com'],
    credentials: true,
}));

// 健康检查
app.get('/', (c) => c.json({
    name: 'SoloMedia API',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
}));

// Debug endpoint to test db.query
import { db, contents, users } from './db';
import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.get('/api/debug/db', async (c) => {
    try {
        // Test 1: Simple select
        const usersCount = await db.select().from(users);
        // Test 2: Query API
        const queryResult = await db.query.users.findMany({ limit: 1 });
        return c.json({
            success: true,
            selectWorked: true,
            usersCount: usersCount.length,
            queryWorked: true,
            queryResult: queryResult.length
        });
    } catch (error: any) {
        console.error('DB Debug Error:', error);
        return c.json({
            success: false,
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 5)
        }, 500);
    }
});

// Debug JWT verification
app.get('/api/debug/jwt', async (c) => {
    const authHeader = c.req.header('Authorization');
    const jwtSecretUsed = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({
            success: false,
            error: 'No valid Authorization header',
            jwtSecretPrefix: jwtSecretUsed.slice(0, 5) + '...'
        }, 401);
    }

    const token = authHeader.slice(7);
    try {
        const payload = await verify(token, jwtSecretUsed, 'HS256');
        return c.json({
            success: true,
            payload,
            jwtSecretPrefix: jwtSecretUsed.slice(0, 5) + '...'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message,
            jwtSecretPrefix: jwtSecretUsed.slice(0, 5) + '...',
            tokenPrefix: token.slice(0, 30) + '...'
        }, 500);
    }
});


// API路由
app.route('/api/auth', authRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/platforms', platformRoutes);
app.route('/api/comments', commentRoutes);

// 错误处理
app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({
        success: false,
        error: err.message || 'Internal Server Error',
    }, 500);
});

// 404处理
app.notFound((c) => {
    return c.json({
        success: false,
        error: 'Not Found',
    }, 404);
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 SoloMedia API Server starting on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

export default app;
