import { Hono } from 'hono';
import { createContentSchema } from '@solomedia/shared';
import { db } from '../db';
import { contents } from '@solomedia/database';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

export const contentRoutes = new Hono();

// 中间件：获取当前用户ID (假设已经在auth中间件中验证并设置了user)
// 这里简化处理，实际应该从c.get('user')获取
const getUserId = (c: any) => {
    // TODO: 从JWT中解析userId
    // 临时返回一个测试ID或者抛出错误
    return 'user-uuid-placeholder';
};

// 获取内容列表
contentRoutes.get('/', async (c) => {
    try {
        const status = c.req.query('status');
        const type = c.req.query('type');

        // 实际场景中应该获取当前用户的ID
        // const userId = getUserId(c);

        const conditions = [];
        if (status) conditions.push(eq(contents.status, status));
        if (type) conditions.push(eq(contents.type, type));

        // conditions.push(eq(contents.userId, userId)); // 加上用户过滤

        const result = await db.query.contents.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: desc(contents.updatedAt),
        });

        return c.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取单个内容
contentRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, id),
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
        const userId = '00000000-0000-0000-0000-000000000000';

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
            .where(eq(contents.id, id))
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
        await db.delete(contents).where(eq(contents.id, id));

        return c.json({
            success: true,
            message: '删除成功',
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

import { publishToWechat } from '../services/wechat';
import { platformConnections, publishRecords } from '@solomedia/database';

// ...

// 发布内容到平台
contentRoutes.post('/:id/publish', async (c) => {
    const id = c.req.param('id');
    const userId = getUserId(c); // 简化: 暂时用mock ID
    // 实际项目中 userId 应该从 Auth 中间件获取 (c.get('user').id)

    try {
        const { platforms } = await c.req.json();

        // 1. 获取内容详情
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, id),
        });

        if (!content) return c.json({ success: false, error: '内容不存在' }, 404);

        // 2. 更新状态为 publishing
        await db.update(contents)
            .set({ status: 'scheduled' })
            .where(eq(contents.id, id));

        const results = [];

        // 3. 遍历平台进行发布 (暂时同步处理，生产环境应使用 BullMQ)
        if (platforms && platforms.includes('wechat')) {
            // 查找该用户的微信连接
            const connection = await db.query.platformConnections.findFirst({
                where: and(
                    eq(platformConnections.userId, '00000000-0000-0000-0000-000000000000'), // 临时Hack: 使用创建时的 mock userId
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
