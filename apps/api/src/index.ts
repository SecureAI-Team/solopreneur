import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { contentRoutes } from './routes/content';
import { analyticsRoutes } from './routes/analytics';
import { aiRoutes } from './routes/ai';

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

// API路由
app.route('/api/auth', authRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);

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
