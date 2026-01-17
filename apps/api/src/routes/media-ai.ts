
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateImage, generateSpeech } from '@solomedia/ai';

const app = new Hono();

// Schema definition
const imageGenSchema = z.object({
    prompt: z.string().min(1, "提示词不能为空"),
    style: z.string().optional(),
    size: z.enum(['1024*1024', '720*1280', '1280*720']).optional()
});

/**
 * POST /ai/image/generate
 * 生成图片 (通义万相)
 */
app.post('/image/generate', zValidator('json', imageGenSchema), async (c) => {
    const { prompt, style, size } = c.req.valid('json');

    try {
        const result = await generateImage({
            prompt,
            style,
            size
        });

        if (result && result.url) {
            return c.json({
                success: true,
                data: { url: result.url }
            });
        } else {
            return c.json({ success: false, error: "Image generation failed" }, 500);
        }

    } catch (e) {
        console.error('Image Gen API Error:', e);
        return c.json({ success: false, error: "Internal Server Error" }, 500);
    }
});

/**
 * POST /ai/voice/tts
 * 语音合成 (CosyVoice) - Mock
 */
app.post('/voice/tts', zValidator('json', z.object({ text: z.string() })), async (c) => {
    const { text } = c.req.valid('json');
    try {
        await generateSpeech({ text });
        // Mock response
        return c.json({ success: true, message: "TTS triggered (Mock)" });
    } catch (e) {
        return c.json({ success: false }, 500);
    }
});

export const mediaAiRoutes = app;

/**
 * POST /ai/text/polish
 * Agentic AI Content Polish (Writer -> Critic -> Compliance)
 */
app.post('/text/polish', zValidator('json', z.object({
    topic: z.string(),
    platform: z.string(),
    style: z.string().optional(),
    userContext: z.object({
        niche: z.string().optional(),
        audience: z.string().optional(),
        style: z.string().optional(),
        contentDNA: z.object({
            persona: z.string().optional(),
            visualStyle: z.string().optional(),
            voice: z.string().optional(),
            bio: z.string().optional(),
        }).optional(),
        learnedPatterns: z.object({
            keywords: z.array(z.string()).optional(),
            tone: z.string().optional(),
            emojiStyle: z.string().optional(),
            hookPatterns: z.array(z.string()).optional(),
        }).optional(),
    }).optional()
})), async (c) => {
    const { topic, platform, userContext } = c.req.valid('json');

    try {
        // Import dynamically to ensure it's loaded after env vars
        const { runContentAgent } = await import('@solomedia/ai');

        // Pass user context for personalized results
        const content = await runContentAgent(topic, platform, userContext);

        return c.json({
            success: true,
            data: {
                content,
                agent: "LangGraph Writer-Critic-Compliance",
                personalized: !!userContext
            }
        });

    } catch (e: any) {
        console.error('Agentic Polish Failed:', e);
        return c.json({
            success: false,
            error: e.message || "Agent execution failed"
        }, 500);
    }
});

/**
 * POST /ai/learn
 * Extract learning patterns from user's content for AI personalization
 */
app.post('/learn', zValidator('json', z.object({
    contents: z.array(z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
        platform: z.string().optional(),
        // Performance metrics to weight learning
        views: z.number().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
    }))
})), async (c) => {
    const { contents } = c.req.valid('json');

    try {
        // Aggregate text from all content
        const allText = contents.map(c => `${c.title}\n${c.body}`).join('\n\n');

        // Calculate weights based on engagement
        const totalEngagement = contents.reduce((sum, c) =>
            sum + (c.views || 0) + (c.likes || 0) * 10 + (c.comments || 0) * 20, 0
        );

        // Use AI to extract patterns
        const { ChatOpenAI } = await import('@langchain/openai');
        const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

        const model = new ChatOpenAI({
            modelName: 'qwen-max',
            openAIApiKey: process.env.DASHSCOPE_API_KEY || 'dummy',
            configuration: {
                baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            },
            temperature: 0.3,
        });

        const response = await model.invoke([
            new SystemMessage(`You are a content analysis expert. Analyze the following social media content and extract patterns. Return a JSON object with:
- keywords: array of 10 most frequently used meaningful words/phrases
- tone: the overall tone (e.g., "幽默搞笑", "专业严谨", "温柔治愈")
- emojiStyle: emoji usage pattern (e.g., "频繁使用表情", "简洁无表情", "适度点缀")
- hookPatterns: array of 3 most effective hook/opening patterns used
- avgLength: average content length category ("short", "medium", "long")

Return ONLY valid JSON, no markdown code blocks.`),
            new HumanMessage(`Analyze this content:\n\n${allText.slice(0, 8000)}`) // Limit to 8k chars
        ]);

        let learnedPatterns;
        try {
            const jsonStr = (response.content as string).replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            learnedPatterns = JSON.parse(jsonStr);
        } catch {
            // Fallback if AI doesn't return valid JSON
            learnedPatterns = {
                keywords: [],
                tone: '未知',
                emojiStyle: '未知',
                hookPatterns: [],
                avgLength: 'medium'
            };
        }

        return c.json({
            success: true,
            data: {
                learnedPatterns,
                contentCount: contents.length,
                totalEngagement
            }
        });

    } catch (e: any) {
        console.error('Content Learning Failed:', e);
        return c.json({
            success: false,
            error: e.message || "Learning extraction failed"
        }, 500);
    }
});

export default app;
