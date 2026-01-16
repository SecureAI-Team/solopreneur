import { Hono } from 'hono';
import { db, analytics, publishRecords, contents } from '../db';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { getDashboardStats } from '../services/stats';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const analyticsRoutes = new Hono();

// 获取概览数据
analyticsRoutes.get('/dashboard', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return c.json({ success: false, error: '未授权' }, 401);
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        const stats = await getDashboardStats(userId);

        return c.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取平台分布
analyticsRoutes.get('/platforms', async (c) => {
    try {
        // 按平台分组统计
        // 由于平台信息在platform_connections表，这里简化为直接按发布记录查询，实际需要join
        // 暂时返回空或者模拟数据，直到关联查询完善
        return c.json({
            success: true,
            data: [
                { platform: 'douyin', name: '抖音', views: 0, percentage: 0, followers: 0 },
                { platform: 'xiaohongshu', name: '小红书', views: 0, percentage: 0, followers: 0 },
            ],
            message: '平台数据统计需完善关联查询'
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取热门内容
analyticsRoutes.get('/top-content', async (c) => {
    try {
        const limit = Number(c.req.query('limit')) || 10;

        const result = await db
            .select({
                id: contents.id,
                title: contents.title,
                views: analytics.views,
                likes: analytics.likes,
                comments: analytics.comments,
                shares: analytics.shares,
            })
            .from(analytics)
            .innerJoin(publishRecords, eq(analytics.publishRecordId, publishRecords.id))
            .innerJoin(contents, eq(publishRecords.contentId, contents.id))
            .orderBy(desc(analytics.views))
            .limit(limit);

        return c.json({
            success: true,
            data: result.map(item => ({
                id: item.id,
                title: item.title,
                platform: 'all', // 简化
                views: item.views,
                engagement: ((item.likes! + item.comments! + item.shares!) / (item.views! || 1) * 100).toFixed(1),
            })),
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取趋势数据
analyticsRoutes.get('/trend', async (c) => {
    try {
        const days = Number(c.req.query('days')) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 按日期分组统计
        const result = await db
            .select({
                date: sql<string>`to_char(${analytics.recordedAt}, 'YYYY-MM-DD')`,
                views: sql<number>`sum(${analytics.views})`,
                interactions: sql<number>`sum(${analytics.likes} + ${analytics.comments} + ${analytics.shares})`,
            })
            .from(analytics)
            .where(gte(analytics.recordedAt, startDate))
            .groupBy(sql`to_char(${analytics.recordedAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${analytics.recordedAt}, 'YYYY-MM-DD')`);

        return c.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取单个内容的分析
analyticsRoutes.get('/content/:id', async (c) => {
    const id = c.req.param('id');
    try {
        // 聚合该内容在所有平台的发布记录统计
        // 先找到该内容的所有发布记录
        const records = await db
            .select({
                id: publishRecords.id
            })
            .from(publishRecords)
            .where(eq(publishRecords.contentId, id));

        if (records.length === 0) {
            return c.json({ success: true, data: { totalViews: 0, likes: 0, comments: 0, shares: 0 } });
        }

        const recordIds = records.map(r => r.id);

        const [stats] = await db
            .select({
                totalViews: sql<number>`sum(${analytics.views})`,
                likes: sql<number>`sum(${analytics.likes})`,
                comments: sql<number>`sum(${analytics.comments})`,
                shares: sql<number>`sum(${analytics.shares})`,
            })
            .from(analytics)
            .where(sql`${analytics.publishRecordId} IN ${recordIds}`);

        return c.json({
            success: true,
            data: {
                contentId: id,
                ...stats,
                avgWatchTime: 0, // 需要更多字段支持
                completionRate: 0,
            },
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
