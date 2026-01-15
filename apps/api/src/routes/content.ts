import { Hono } from 'hono';
import { createContentSchema } from '@solomedia/shared';

export const contentRoutes = new Hono();

// 模拟内容数据
const mockContents = [
    {
        id: '1',
        title: '冬季护肤必备单品推荐',
        body: '今天给大家分享几款冬季必备的护肤品...',
        type: 'image',
        status: 'published',
        platforms: ['xiaohongshu'],
        mediaUrls: [],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14'),
    },
    {
        id: '2',
        title: '5分钟早餐合集第8期',
        body: '快手早餐系列又来啦！',
        type: 'video',
        status: 'published',
        platforms: ['douyin', 'kuaishou'],
        mediaUrls: [],
        createdAt: new Date('2026-01-13'),
        updatedAt: new Date('2026-01-13'),
    },
];

// 获取内容列表
contentRoutes.get('/', async (c) => {
    const status = c.req.query('status');
    const type = c.req.query('type');

    let filtered = [...mockContents];
    if (status) filtered = filtered.filter(item => item.status === status);
    if (type) filtered = filtered.filter(item => item.type === type);

    return c.json({
        success: true,
        data: filtered,
    });
});

// 获取单个内容
contentRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');
    const content = mockContents.find(item => item.id === id);

    if (!content) {
        return c.json({ success: false, error: '内容不存在' }, 404);
    }

    return c.json({ success: true, data: content });
});

// 创建内容
contentRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const validated = createContentSchema.parse(body);

        const newContent = {
            id: crypto.randomUUID(),
            ...validated,
            status: 'draft',
            mediaUrls: validated.mediaUrls || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // TODO: 保存到数据库

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
    const body = await c.req.json();

    // TODO: 更新数据库

    return c.json({
        success: true,
        data: { id, ...body, updatedAt: new Date() },
        message: '更新成功',
    });
});

// 删除内容
contentRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id');

    // TODO: 从数据库删除

    return c.json({
        success: true,
        message: '删除成功',
    });
});

// 发布内容到平台
contentRoutes.post('/:id/publish', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { platforms } = body;

    // TODO: 调用各平台API发布

    return c.json({
        success: true,
        data: {
            contentId: id,
            platforms,
            status: 'publishing',
        },
        message: '正在发布中',
    });
});
