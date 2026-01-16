import { Hono } from 'hono';
import { db, automationRules } from '../db';
import { eq, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const automationRoutes = new Hono();

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
        throw new Error('无效的Token');
    }
};

// 获取所有规则
automationRoutes.get('/', async (c) => {
    try {
        const userId = await getUserId(c);
        const rules = await db.query.automationRules.findMany({
            where: eq(automationRules.userId, userId),
        });

        // 定义默认规则类型
        const defaultTypes = [
            { type: 'auto_reply', label: '自动回复', desc: '智能回复评论' },
            { type: 'auto_like', label: '自动点赞', desc: '点赞相关内容, 提升账号活跃度' },
            { type: 'cross_sync', label: '多平台同步', desc: '自动同步内容到所有已连接平台' },
            { type: 'ai_optimize', label: 'AI 内容优化', desc: '发布前自动优化标题和标签' },
        ];

        // Merge DB rules with defaults
        const result = defaultTypes.map(def => {
            const existing = rules.find(r => r.type === def.type);
            return existing ? { ...existing, ...def } : {
                type: def.type,
                isEnabled: false,
                config: {},
                ...def
            };
        });

        return c.json({ success: true, data: result });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 切换规则状态
automationRoutes.post('/toggle', async (c) => {
    try {
        const userId = await getUserId(c);
        const { type, isEnabled } = await c.req.json();

        if (!type) return c.json({ success: false, error: '缺少规则类型' }, 400);

        const existing = await db.query.automationRules.findFirst({
            where: and(
                eq(automationRules.userId, userId),
                eq(automationRules.type, type)
            ),
        });

        if (existing) {
            await db.update(automationRules)
                .set({ isEnabled, updatedAt: new Date() })
                .where(eq(automationRules.id, existing.id));
        } else {
            await db.insert(automationRules).values({
                userId,
                type,
                isEnabled: !!isEnabled,
                config: {},
            });
        }

        return c.json({ success: true, message: '设置已更新' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
