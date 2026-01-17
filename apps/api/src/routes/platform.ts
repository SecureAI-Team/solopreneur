
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db, platformConnections } from '../db';
import { eq } from 'drizzle-orm';

export const platformRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to get user ID from token
async function getUserId(authHeader: string | undefined): Promise<string | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        return payload.userId as string;
    } catch {
        return null;
    }
}

// 获取用户已连接的平台列表 (保持兼容性，但现在含义是"用户关注的平台")
platformRoutes.get('/connected', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ success: false, error: '未授权' }, 401);
    }

    let userId: string;
    try {
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        userId = payload.userId as string;
    } catch {
        return c.json({ success: false, error: 'Token无效' }, 401);
    }

    try {
        // 在新模式下，我们主要返回受支持的平台列表，以及用户是否已经"启用"了该平台(关联了数据)
        // 暂时简单返回所有支持的平台，标记 connected 为 false (除非我们有 syncedAnalytics 数据)

        const supportedPlatforms = [
            { id: 'douyin', name: '抖音', icon: 'douyin' },
            { id: 'xiaohongshu', name: '小红书', icon: 'xiaohongshu' },
            { id: 'bilibili', name: 'Bilibili', icon: 'bilibili' },
            { id: 'wechat', name: '微信公众号', icon: 'wechat' }
        ];

        // 查询用户是否有同步过数据
        // const synced = await db.query.syncedAnalytics.findMany... 
        // 暂时简化

        return c.json({
            success: true,
            data: supportedPlatforms.map(p => ({
                platform: p.id,
                username: 'Tool Mode',
                avatar: undefined,
                followers: 0,
                isActive: true,
                connectedAt: new Date()
            }))
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取各平台自动发布/复制配置
platformRoutes.get('/config', (c) => {
    return c.json({
        success: true,
        data: {
            douyin: {
                maxLength: 4000,
                supportTags: true,
                copyTemplate: "{{title}}\n\n{{content}}\n\n{{tags}}"
            },
            xiaohongshu: {
                maxLength: 1000,
                supportTags: true,
                copyTemplate: "{{title}}\n\n{{content}}\n\n{{tags}}"
            }
        }
    });
});

