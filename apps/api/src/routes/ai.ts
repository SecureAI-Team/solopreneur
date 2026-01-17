import { Hono } from 'hono';
import {
    generateOutline,
    optimizeTitles,
    assistantChat,
    generateInsights,
    generateNicheAnalysis,
    generateContentDNA,
    polishContent,
    generateLayout,
    type ChatMessage
} from '@solomedia/ai';
import { db, aiConversations } from '../db';
import { eq } from 'drizzle-orm';

export const aiRoutes = new Hono();

// AI选题推荐
aiRoutes.get('/topics', async (c) => {
    const category = c.req.query('category');
    const platform = c.req.query('platform');

    try {
        const topics = await generateTopics({ category, platform });

        return c.json({
            success: true,
            data: topics.map((t, index) => ({
                id: String(index + 1),
                ...t,
                platform: platform || 'all',
            })),
        });
    } catch (error: any) {
        console.error('AI选题推荐失败:', error);

        // 降级返回模拟数据
        return c.json({
            success: true,
            data: [
                {
                    id: '1',
                    title: '2026春节回家必备好物清单',
                    type: 'seasonal',
                    platform: platform || 'xiaohongshu',
                    score: 95,
                    reason: '春节临近，相关搜索量上升200%',
                },
                {
                    id: '2',
                    title: '3分钟学会XX技巧',
                    type: 'evergreen',
                    platform: platform || 'douyin',
                    score: 88,
                    reason: '快节奏教程类内容持续受欢迎',
                },
            ],
            _fallback: true,
        });
    }
});

// AI生成内容大纲
aiRoutes.post('/generate', async (c) => {
    try {
        const body = await c.req.json();
        const { topic, platform, contentType } = body;

        if (!topic) {
            return c.json({ success: false, error: '请提供选题' }, 400);
        }

        const result = await generateOutline({
            topic,
            platform: platform || 'douyin',
            contentType: contentType || 'video',
        });

        return c.json({
            success: true,
            data: {
                ...result,
                estimatedDuration: contentType === 'video' ? '3-5分钟' : undefined,
            },
        });
    } catch (error: any) {
        console.error('AI内容生成失败:', error);
        return c.json({
            success: false,
            error: error.message || '生成失败，请稍后重试',
        }, 500);
    }
});

// AI优化标题
aiRoutes.post('/optimize-title', async (c) => {
    try {
        const body = await c.req.json();
        const { title, platform } = body;

        if (!title) {
            return c.json({ success: false, error: '请提供标题' }, 400);
        }

        const optimized = await optimizeTitles({
            title,
            platform: platform || 'douyin',
        });

        return c.json({
            success: true,
            data: optimized,
        });
    } catch (error: any) {
        console.error('AI标题优化失败:', error);
        return c.json({
            success: false,
            error: error.message || '优化失败，请稍后重试',
        }, 500);
    }
});

// AI对话
aiRoutes.post('/chat', async (c) => {
    try {
        const body = await c.req.json();
        const { message, history = [], userId } = body; // 需要从auth中间件获取userId

        if (!message) {
            return c.json({ success: false, error: '请输入消息' }, 400);
        }

        const messages: ChatMessage[] = [
            { role: 'user', content: message },
        ];

        const historyMessages: ChatMessage[] = history.map((h: any) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
        }));

        const response = await assistantChat(messages, historyMessages);

        // 临时用户ID占位符，生产环境应从Token获取
        const currentUserId = userId || '00000000-0000-0000-0000-000000000000';

        // 异步保存对话历史
        try {
            await db.insert(aiConversations).values({
                userId: currentUserId,
                messages: [...historyMessages, ...messages, { role: 'assistant', content: response }],
            });
        } catch (dbError) {
            console.error('保存对话历史失败:', dbError);
            // 不中断主流程
        }

        return c.json({
            success: true,
            data: {
                role: 'assistant',
                content: response,
                conversationId: crypto.randomUUID(),
            },
        });
    } catch (error: any) {
        console.error('AI对话失败:', error);
        return c.json({
            success: false,
            error: error.message || '对话失败，请稍后重试',
        }, 500);
    }
});

// 数据洞察
aiRoutes.get('/insights', async (c) => {
    try {
        // 实际场景应从数据库获取用户数据
        const mockData = {
            platforms: [
                { name: '抖音', views: 65000, followers: 12500 },
                { name: '小红书', views: 32000, followers: 8200 },
                { name: 'B站', views: 18000, followers: 5600 },
            ],
            topContent: [
                { title: '冬季护肤必备', views: 45000, engagement: 12.5 },
                { title: '早餐合集', views: 28000, engagement: 8.3 },
            ],
        };

        const insights = await generateInsights(mockData);

        return c.json({
            success: true,
            data: insights.length > 0 ? insights : [
                {
                    type: 'timing',
                    title: '最佳发布时间',
                    content: '周六晚8-10点发布互动率最高',
                    confidence: 0.85,
                },
                {
                    type: 'content',
                    title: '内容类型建议',
                    content: '美食类内容表现优异，建议增加比例',
                    confidence: 0.78,
                },
            ],
        });
    } catch (error: any) {
        console.error('AI洞察生成失败:', error);
        return c.json({
            success: true,
            data: [
                {
                    type: 'timing',
                    title: '最佳发布时间',
                    content: '周六晚8-10点发布互动率最高',
                    confidence: 0.85,
                },
            ],
        });
    }
});
// AI赛道雷达
aiRoutes.post('/niche-analysis', async (c) => {
    try {
        const body = await c.req.json();
        const { interests, skills, timeAvailable } = body;

        if (!interests || !skills) {
            return c.json({ success: false, error: '请提供兴趣和技能' }, 400);
        }

        const result = await generateNicheAnalysis({
            interests,
            skills,
            timeAvailable
        });

        return c.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('赛道分析失败:', error);
        return c.json({
            success: false,
            error: error.message || '分析失败'
        }, 500);
    }
});

// AI内容DNA
aiRoutes.post('/content-dna', async (c) => {
    try {
        const body = await c.req.json();
        const { niche } = body;

        if (!niche) {
            return c.json({ success: false, error: '请提供赛道' }, 400);
        }

        const result = await generateContentDNA({ niche });

        return c.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('DNA生成失败:', error);
        return c.json({
            success: false,
            error: error.message || '生成失败'
        }, 500);
    }
});

// AI内容润色
aiRoutes.post('/text/polish', async (c) => {
    try {
        const body = await c.req.json();
        const { content, platform, instruction } = body;

        if (!content) {
            return c.json({ success: false, error: '请提供内容' }, 400);
        }

        const result = await polishContent({
            content,
            platform: platform || 'douyin',
            instruction
        });

        return c.json({
            success: true,
            data: {
                content: result.content,
                changes: result.changes,
                quality: result.quality,
                agent: 'AI Editor'
            }
        });
    } catch (error: any) {
        console.error('AI润色失败:', error);
        return c.json({
            success: false,
            error: error.message || '润色失败'
        }, 500);
    }
});

// AI排版优化
aiRoutes.post('/layout', async (c) => {
    try {
        const body = await c.req.json();
        const { content, platform } = body;

        if (!content) {
            return c.json({ success: false, error: '请提供内容' }, 400);
        }

        const result = await generateLayout({
            content,
            platform: platform || 'xiaohongshu'
        });

        return c.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('AI排版失败:', error);
        return c.json({
            success: false,
            error: error.message || '排版失败'
        }, 500);
    }
});
