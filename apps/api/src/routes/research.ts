
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db, research } from '../db';
import { desc, eq } from 'drizzle-orm';
import { createQwenClient } from '@solomedia/ai';

export const researchRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 同步调研数据 (Extension -> API)
researchRoutes.post('/sync', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return c.json({ success: false, error: '未授权' }, 401);
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        const body = await c.req.json();
        const { keyword, platform, rawData } = body;

        if (!keyword || !platform || !rawData) {
            return c.json({ success: false, error: '缺少参数' }, 400);
        }

        // 1. 保存原始数据
        // @ts-ignore
        const [savedRecord] = await db.insert(research).values({
            userId,
            keyword,
            platform,
            rawData,
            createdAt: new Date()
        }).returning();

        // 2. 触发 AI 分析 (异步或同步)
        // 简单起见，这里先同步调用(耗时可能较长)，或者仅标记为"待分析"
        // 为了演示 Agentic 效果，我们尝试在这里做简单的分析

        try {
            // 构造 Prompt
            const titles = (rawData as any[]).slice(0, 10).map(i => i.title).join('\n');
            const systemPrompt = "你是一个自媒体运营专家。请根据以下热门内容的标题，分析该赛道的爆款规律。请给出3个具体的创作建议。";

            // 调用 AI (假设 @solomedia/ai 已配置好)
            // const ai = createQwenClient(); 
            // const analysis = await ai.chat.completions... 

            // 暂时用 Mock 分析结果，以免阻塞
            const analysis = `### 🔍 赛道分析: ${keyword} (${platform})
1. **标题套路**: Top 10 爆款中有 7 个使用了数字开头 (e.g., "3个技巧...", "5分钟学会...")。
2. **痛点直击**: 普遍关注"新手入门"和"避坑指南"。
3. **视觉建议**: 封面多采用高饱和度背景色 (黄/红) 配合大字标题。`;

            // 更新分析结果
            // @ts-ignore
            await db.update(research)
                .set({ analysis })
                .where(eq(research.id, savedRecord.id));

        } catch (e) {
            console.error('AI Analysis failed:', e);
        }

        return c.json({ success: true, message: '调研数据同步完成' });

    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// 获取历史调研记录
researchRoutes.get('/history', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return c.json({ success: false, error: '未授权' }, 401);
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        // @ts-ignore
        const history = await db.select().from(research)
            .where(eq(research.userId, userId))
            .orderBy(desc(research.createdAt))
            .limit(20);

        return c.json({
            success: true,
            data: history
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
