import { Hono } from 'hono';
import { createContentSchema } from '@solomedia/shared';
import { db, contents, platformConnections, publishRecords } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

export const contentRoutes = new Hono();

import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const getUserId = async (c: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('未授权');
    }
    const token = authHeader.slice(7);
    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');
        return payload.userId as string;
    } catch (e: any) {
        console.error('Token verification failed:', e.message, 'Token prefix:', token.slice(0, 20));
        throw new Error('无效的Token');
    }
};

// 获取内容列表
contentRoutes.get('/', async (c) => {
    try {
        const status = c.req.query('status');
        const type = c.req.query('type');

        // 实际场景中应该获取当前用户的ID
        const userId = await getUserId(c);
        console.log('getUserId returned:', userId);

        const conditions = [];
        if (status) conditions.push(eq(contents.status, status));
        if (type) conditions.push(eq(contents.type, type));

        conditions.push(eq(contents.userId, userId)); // 加上用户过滤

        const result = await db.query.contents.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: (contents, { desc }) => [desc(contents.updatedAt)],
        });

        return c.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Content list error:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
});


// 获取单个内容
contentRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const userId = await getUserId(c);
        const content = await db.query.contents.findFirst({
            where: and(
                eq(contents.id, id),
                eq(contents.userId, userId)
            ),
        });

        if (!content) {
            return c.json({ success: false, error: '内容不存在' }, 404);
        }

        return c.json({ success: true, data: content });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 创建内容
contentRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const validated = createContentSchema.parse(body);

        // 临时用户ID，生产环境需替换
        const userId = await getUserId(c);

        const [newContent] = await db.insert(contents).values({
            userId,
            title: validated.title,
            body: validated.body,
            type: validated.type,
            status: 'draft',
            platforms: validated.platforms || [],
            mediaUrls: validated.mediaUrls || [],
        }).returning();

        return c.json({
            success: true,
            data: newContent,
            message: '内容创建成功',
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || '创建失败',
        }, 400);
    }
});

// 更新内容
contentRoutes.put('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const body = await c.req.json();
        // 简单的部分更新验证
        const schema = z.object({
            title: z.string().optional(),
            body: z.string().optional(),
            status: z.string().optional(),
            platforms: z.array(z.string()).optional(),
            mediaUrls: z.array(z.string()).optional(),
        });

        const updates = schema.parse(body);

        const [updatedContent] = await db.update(contents)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(and(
                eq(contents.id, id),
                eq(contents.userId, await getUserId(c))
            ))
            .returning();

        if (!updatedContent) {
            return c.json({ success: false, error: '内容未找到或更新失败' }, 404);
        }

        return c.json({
            success: true,
            data: updatedContent,
            message: '更新成功',
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 400);
    }
});

// 删除内容
contentRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const userId = await getUserId(c);
        await db.delete(contents).where(and(
            eq(contents.id, id),
            eq(contents.userId, userId)
        ));

        return c.json({
            success: true,
            message: '删除成功',
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

import { publishToWechat } from '../services/wechat';
import { publishToDouyin } from '../services/douyin';
import { publishToXiaohongshu } from '../services/xiaohongshu';
import { publishToBilibili } from '../services/bilibili';

// ...

// 发布内容到平台
contentRoutes.post('/:id/publish', async (c) => {
    const id = c.req.param('id');
    const userId = await getUserId(c);

    try {
        const { platforms, scheduledAt } = await c.req.json();

        // 1. 获取内容详情
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, id),
        });

        if (!content) return c.json({ success: false, error: '内容不存在' }, 404);

        // Check for scheduling
        if (scheduledAt) {
            const scheduleDate = new Date(scheduledAt);
            if (scheduleDate > new Date()) {
                await db.update(contents)
                    .set({
                        status: 'scheduled',
                        scheduledAt: scheduleDate,
                        platforms: platforms || content.platforms
                    })
                    .where(eq(contents.id, id));

                return c.json({
                    success: true,
                    message: '内容已加入发布计划',
                    data: { contentId: id, status: 'scheduled', scheduledAt }
                });
            }
        }

        // 2. 更新状态为 publishing (Immediate publish)
        await db.update(contents)
            .set({ status: 'scheduled' }) // Keep as scheduled or change to 'publishing' based on preference, logical flow uses scheduled->success
            .where(eq(contents.id, id));

        const results = [];

        // 3. 遍历平台进行发布 (暂时同步处理，生产环境应使用 BullMQ)
        if (platforms && platforms.includes('wechat')) {
            // 查找该用户的微信连接
            const connection = await db.query.platformConnections.findFirst({
                where: and(
                    eq(platformConnections.userId, userId),
                    eq(platformConnections.platform, 'wechat')
                )
            });

            if (connection) {
                // 创建 publishing 记录
                const [record] = await db.insert(publishRecords).values({
                    contentId: id,
                    platformConnectionId: connection.id,
                    status: 'publishing'
                }).returning();

                try {
                    // 调用 Service
                    const res = await publishToWechat(connection.userId, id, connection.id);

                    // 更新记录成功
                    await db.update(publishRecords).set({
                        status: 'published',
                        platformPostId: res.platformPostId,
                        publishedAt: new Date()
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'wechat', status: 'success', url: res.url });
                } catch (err: any) {
                    await db.update(publishRecords).set({
                        status: 'failed',
                        errorMessage: err.message
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'wechat', status: 'failed', error: err.message });
                }
            } else {
                results.push({ platform: 'wechat', status: 'failed', error: 'No connection found' });
            }
        }

        if (platforms && platforms.includes('douyin')) {
            const connection = await db.query.platformConnections.findFirst({
                where: and(
                    eq(platformConnections.userId, userId),
                    eq(platformConnections.platform, 'douyin')
                )
            });

            if (connection) {
                const [record] = await db.insert(publishRecords).values({
                    contentId: id,
                    platformConnectionId: connection.id,
                    status: 'publishing'
                }).returning();

                try {
                    const res = await publishToDouyin(connection.userId, id, connection.id);

                    await db.update(publishRecords).set({
                        status: 'published',
                        platformPostId: res.platformPostId,
                        publishedAt: new Date()
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'douyin', status: 'success', url: res.url });
                } catch (err: any) {
                    await db.update(publishRecords).set({
                        status: 'failed',
                        errorMessage: err.message
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'douyin', status: 'failed', error: err.message });
                }
            } else {
                results.push({ platform: 'douyin', status: 'failed', error: 'No connection found' });
            }
        }

        if (platforms && platforms.includes('xiaohongshu')) {
            const connection = await db.query.platformConnections.findFirst({
                where: and(
                    eq(platformConnections.userId, userId),
                    eq(platformConnections.platform, 'xiaohongshu')
                )
            });

            if (connection) {
                const [record] = await db.insert(publishRecords).values({
                    contentId: id,
                    platformConnectionId: connection.id,
                    status: 'publishing'
                }).returning();

                try {
                    const res = await publishToXiaohongshu(connection.userId, id, connection.id);

                    await db.update(publishRecords).set({
                        status: 'published',
                        platformPostId: res.platformPostId,
                        publishedAt: new Date()
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'xiaohongshu', status: 'success', url: res.url });
                } catch (err: any) {
                    await db.update(publishRecords).set({
                        status: 'failed',
                        errorMessage: err.message
                    }).where(eq(publishRecords.id, record.id));

                    results.push({ platform: 'xiaohongshu', status: 'failed', error: err.message });
                }
            } else {
                results.push({ platform: 'xiaohongshu', status: 'failed', error: 'No connection found' });
            }

            if (platforms && platforms.includes('bilibili')) {
                const connection = await db.query.platformConnections.findFirst({
                    where: and(
                        eq(platformConnections.userId, userId),
                        eq(platformConnections.platform, 'bilibili')
                    )
                });

                if (connection) {
                    const [record] = await db.insert(publishRecords).values({
                        contentId: id,
                        platformConnectionId: connection.id,
                        status: 'publishing'
                    }).returning();

                    try {
                        const res = await publishToBilibili(connection.userId, id, connection.id);

                        await db.update(publishRecords).set({
                            status: 'published',
                            platformPostId: res.platformPostId,
                            publishedAt: new Date()
                        }).where(eq(publishRecords.id, record.id));

                        results.push({ platform: 'bilibili', status: 'success', url: res.url });
                    } catch (err: any) {
                        await db.update(publishRecords).set({
                            status: 'failed',
                            errorMessage: err.message
                        }).where(eq(publishRecords.id, record.id));

                        results.push({ platform: 'bilibili', status: 'failed', error: err.message });
                    }
                } else {
                    results.push({ platform: 'bilibili', status: 'failed', error: 'No connection found' });
                }
            }
        }

        return c.json({
            success: true,
            message: '发布处理完成',
            data: {
                contentId: id,
                results
            }
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
