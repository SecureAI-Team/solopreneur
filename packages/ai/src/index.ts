/**
 * SoloMedia AI 服务
 * 使用 OpenAI SDK 连接阿里云通义千问 (兼容模式)
 */

import OpenAI from 'openai';

// 创建OpenAI客户端（连接阿里云百炼）
function createClient() {
    const apiKey = process.env.DASHSCOPE_API_KEY;

    if (!apiKey) {
        throw new Error('DASHSCOPE_API_KEY 环境变量未设置');
    }

    return new OpenAI({
        apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
}

// 默认模型配置
const DEFAULT_MODEL = 'qwen-turbo'; // qwen-turbo / qwen-plus / qwen-max

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * 通用对话接口
 */
export async function chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
): Promise<string> {
    const client = createClient();

    const response = await client.chat.completions.create({
        model: options.model || DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
    });

    return response.choices[0]?.message?.content || '';
}

/**
 * AI选题推荐
 */
export async function generateTopics(params: {
    category?: string;
    platform?: string;
    userHistory?: string;
}): Promise<{ title: string; type: string; reason: string; score: number }[]> {
    const systemPrompt = `你是一个专业的自媒体运营专家，擅长为创作者推荐热门选题。
请根据用户的需求，推荐5个适合的选题。每个选题包含标题、类型(trending热点/seasonal节日/evergreen常青)、推荐理由和推荐指数(0-100)。
请以JSON数组格式返回，格式如下：
[{"title": "选题标题", "type": "trending", "reason": "推荐理由", "score": 95}]
只返回JSON数组，不要有其他内容。`;

    const userPrompt = `请为我推荐选题：
${params.category ? `领域: ${params.category}` : ''}
${params.platform ? `目标平台: ${params.platform}` : ''}
${params.userHistory ? `我之前的内容方向: ${params.userHistory}` : ''}
请推荐5个选题。`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { temperature: 0.8 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch {
        console.error('解析AI响应失败:', result);
        return [];
    }
}

/**
 * AI生成内容大纲
 */
export async function generateOutline(params: {
    topic: string;
    platform: string;
    contentType: 'video' | 'image' | 'article';
}): Promise<{
    title: string;
    outline: string[];
    script?: string;
    hashtags: string[];
}> {
    const platformGuides: Record<string, string> = {
        douyin: '抖音视频，时长15-60秒，节奏快，开头3秒要抓住注意力',
        xiaohongshu: '小红书笔记，图文结合，标题要有数字和emoji，内容真诚有价值',
        bilibili: 'B站视频，可以更长，内容深度，注重知识性和趣味性',
        wechat: '微信公众号，文章要有深度，排版美观，标题党适度',
    };

    const systemPrompt = `你是一个专业的内容创作者，擅长为不同平台创作内容。
请根据用户提供的选题，生成内容大纲、标题建议和相关标签。
${platformGuides[params.platform] || ''}
请以JSON格式返回：
{"title": "优化后的标题", "outline": ["大纲点1", "大纲点2"], "script": "视频脚本(如果是视频)", "hashtags": ["标签1", "标签2"]}
只返回JSON对象，不要有其他内容。`;

    const userPrompt = `选题：${params.topic}
平台：${params.platform}
内容类型：${params.contentType}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { temperature: 0.7 });

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { title: params.topic, outline: [], hashtags: [] };
    } catch {
        console.error('解析AI响应失败:', result);
        return { title: params.topic, outline: [], hashtags: [] };
    }
}

/**
 * AI优化标题
 */
export async function optimizeTitles(params: {
    title: string;
    platform: string;
}): Promise<{ title: string; score: number }[]> {
    const systemPrompt = `你是一个标题优化专家，擅长创作高点击率的标题。
请为用户提供的标题生成3个优化版本，每个版本要有不同的风格。
考虑平台特点和用户心理，提高标题的吸引力。
请以JSON数组格式返回：
[{"title": "优化后的标题", "score": 预估点击率提升分数(0-100)}]
只返回JSON数组，不要有其他内容。`;

    const userPrompt = `原标题：${params.title}
平台：${params.platform}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { temperature: 0.8 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch {
        console.error('解析AI响应失败:', result);
        return [];
    }
}

/**
 * AI助手对话
 */
export async function assistantChat(
    messages: ChatMessage[],
    history: ChatMessage[] = []
): Promise<string> {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `你是SoloMedia的AI助手，专门帮助自媒体创作者提升内容质量和运营效率。
你可以：
- 推荐热门选题
- 帮助撰写文案和脚本
- 优化标题提升点击率
- 分析运营数据并给出建议
- 回答自媒体运营相关问题

语气友好专业，回答简洁有价值。使用中文回答。`,
    };

    return chat([systemMessage, ...history, ...messages], { temperature: 0.7 });
}

/**
 * 生成数据洞察
 */
export async function generateInsights(data: {
    platforms: { name: string; views: number; followers: number }[];
    topContent: { title: string; views: number; engagement: number }[];
}): Promise<{ type: string; title: string; content: string; confidence: number }[]> {
    const systemPrompt = `你是一个数据分析专家，擅长从运营数据中提取洞察。
根据用户的平台数据，生成3条具体可执行的运营建议。
请以JSON数组格式返回：
[{"type": "timing/content/growth", "title": "洞察标题", "content": "具体建议", "confidence": 0.85}]
只返回JSON数组，不要有其他内容。`;

    const userPrompt = `运营数据：
平台数据: ${JSON.stringify(data.platforms)}
热门内容: ${JSON.stringify(data.topContent)}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { temperature: 0.6 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch {
        console.error('解析AI响应失败:', result);
        return [];
    }
}

export { ChatMessage, ChatOptions };
