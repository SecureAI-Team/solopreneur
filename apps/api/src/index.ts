import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { contentRoutes } from './routes/content';
import { analyticsRoutes } from './routes/analytics';
import { aiRoutes } from './routes/ai';
import mediaAiRoutes from './routes/media-ai';
import { uploadRoutes } from './routes/upload';
import { platformRoutes } from './routes/platform';
import { commentRoutes } from './routes/comments';
import { automationRoutes } from './routes/automation';
import { researchRoutes } from './routes/research';

// ... (imports)

// API路由
app.route('/api/auth', authRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/ai', mediaAiRoutes); // Mount at /api/ai/image, /api/ai/voice
app.route('/api/upload', uploadRoutes);
app.route('/api/platforms', platformRoutes);
app.route('/api/comments', commentRoutes);
app.route('/api/automation', automationRoutes);
app.route('/api/research', researchRoutes); // New
app.route('/api/admin', adminRoutes); // Admin panel routes

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
