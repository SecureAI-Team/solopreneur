/**
 * SoloMedia AI 服务
 * 使用 OpenAI SDK 连接阿里云通义千问 (兼容模式)
 * 质量目标: 98%
 */

import OpenAI from 'openai';

// AI质量配置
export * from './agent';
export const AI_CONFIG = {
    // 模型优先级：按质量从高到低
    models: {
        high: 'qwen-max',      // 通义千问-Max：千亿级参数，推理能力最强
        medium: 'qwen-plus',   // 通义千问-Plus：均衡模型
        fast: 'qwen-turbo',    // 通义千问-Turbo：速度快，成本低
    },
    // 质量保障参数
    quality: {
        targetScore: 0.98,     // 目标质量分数 98%
        retryCount: 3,         // 重试次数
        validateResponse: true, // 是否验证响应格式
    },
    // 默认参数
    defaults: {
        temperature: 0.7,
        maxTokens: 4000,
    },
};

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

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    quality?: 'high' | 'medium' | 'fast';
}

/**
 * 通用对话接口 - 带质量保障
 */
export async function chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
): Promise<string> {
    const client = createClient();

    // 根据质量级别选择模型
    const modelKey = options.quality || 'medium';
    const model = options.model || AI_CONFIG.models[modelKey];

    let lastError: Error | null = null;

    // 重试机制确保高质量输出
    for (let attempt = 0; attempt < AI_CONFIG.quality.retryCount; attempt++) {
        try {
            const response = await client.chat.completions.create({
                model,
                messages,
                temperature: options.temperature ?? AI_CONFIG.defaults.temperature,
                max_tokens: options.maxTokens ?? AI_CONFIG.defaults.maxTokens,
            });

            const content = response.choices[0]?.message?.content || '';

            // 基本质量检查
            if (content.length < 10) {
                throw new Error('AI响应过短，质量不达标');
            }

            return content;
        } catch (error) {
            lastError = error as Error;
            console.warn(`AI请求失败 (尝试 ${attempt + 1}/${AI_CONFIG.quality.retryCount}):`, error);

            // 等待后重试
            if (attempt < AI_CONFIG.quality.retryCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    throw lastError || new Error('AI服务暂时不可用');
}

/**
 * 高质量内容生成 - 用于文案创作
 */
export async function generateHighQualityContent(params: {
    topic: string;
    platform: string;
    contentType: 'video' | 'image' | 'article';
    style?: string;
}): Promise<{
    title: string;
    content: string;
    outline: string[];
    hashtags: string[];
    quality: number;
}> {
    const platformPrompts: Record<string, string> = {
        douyin: `抖音短视频风格：
- 开场3秒必须抓住注意力
- 节奏紧凑，信息密度高
- 口语化表达，亲切自然
- 结尾引导互动（点赞、关注、评论）`,
        xiaohongshu: `小红书笔记风格：
- 标题用数字+emoji+痛点词
- 真诚分享，干货满满
- 分点列举，易于阅读
- 图片描述要生动形象`,
        bilibili: `B站视频风格：
- 可以有深度和长度
- 知识性与趣味性结合
- 梗要自然，不尬
- 注重与观众互动感`,
        wechat: `公众号文章风格：
- 标题要有冲击力
- 开头要引起共鸣
- 内容有观点有深度
- 排版清晰层次分明`,
    };

    const systemPrompt = `你是一位顶级内容创作专家，专门为自媒体创作者生成高质量内容。
你的目标是创作能够获得高互动率的优质内容，质量标准达到98%。

${platformPrompts[params.platform] || ''}

请生成包含以下内容的JSON对象：
{
    "title": "吸引眼球的标题",
    "content": "完整的文案内容，包含开头、正文、结尾",
    "outline": ["核心要点1", "核心要点2", "核心要点3"],
    "hashtags": ["相关标签1", "相关标签2"],
    "quality": 0.98
}

要求：
1. 内容必须原创、有价值
2. 语言流畅自然
3. 符合平台调性
4. 开头3秒/句必须抓住注意力
5. 只返回JSON对象`;

    const userPrompt = `请为以下选题创作内容：
选题：${params.topic}
平台：${params.platform}
类型：${params.contentType}
${params.style ? `风格要求：${params.style}` : ''}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { quality: 'high', temperature: 0.75 });

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title || params.topic,
                content: parsed.content || '',
                outline: parsed.outline || [],
                hashtags: parsed.hashtags || [],
                quality: parsed.quality || 0.95,
            };
        }
    } catch (e) {
        console.error('解析高质量内容失败:', e);
    }

    return {
        title: params.topic,
        content: result,
        outline: [],
        hashtags: [],
        quality: 0.85,
    };
}

/**
 * AI选题推荐 - 高质量版本
 */
export async function generateTopics(params: {
    category?: string;
    platform?: string;
    userHistory?: string;
}): Promise<{ title: string; type: string; reason: string; score: number }[]> {
    const systemPrompt = `你是一位资深自媒体运营专家，擅长识别热点趋势和用户需求。
请根据用户需求推荐5个高质量选题，每个选题都应该：
1. 具有明确的价值点
2. 适合目标平台特性
3. 有爆款潜力

返回JSON数组格式：
[{"title": "选题标题", "type": "trending/seasonal/evergreen", "reason": "推荐理由", "score": 95}]
只返回JSON数组。`;

    const userPrompt = `推荐选题需求：
${params.category ? `领域: ${params.category}` : '综合领域'}
${params.platform ? `平台: ${params.platform}` : '多平台通用'}
${params.userHistory ? `历史方向: ${params.userHistory}` : ''}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { quality: 'medium', temperature: 0.8 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('解析选题推荐失败:', e);
    }
    return [];
}

/**
 * AI内容润色 - 多维度优化
 */
export async function polishContent(params: {
    content: string;
    platform: string;
    instruction?: string; // e.g. "更幽默一点", "精简文字"
}): Promise<{
    content: string;
    changes: string[];
    quality: number;
}> {
    const systemPrompt = `你是顶级内容编辑，擅长优化自媒体文案。
请根据平台特性和用户指令，对文案进行润色。

平台风格参考：
- 抖音: 口语化、节奏快、情绪饱满
- 小红书: 种草感、情绪价值、生活化
- B站: 有梗、专业、真诚
- 公众号: 逻辑清晰、有深度、金句频出

返回JSON格式：
{
    "content": "润色后的完整内容",
    "changes": ["优化了开头吸引力", "增加了互动引导"],
    "quality": 0.95
}`;

    const userPrompt = `原文：
${params.content}

平台：${params.platform}
${params.instruction ? `优化指令：${params.instruction}` : ''}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { quality: 'high', temperature: 0.7 });

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }

    return { content: params.content, changes: [], quality: 0 };
}

/**
 * AI排版优化 - 针对平台特性的视觉结构优化
 */
export async function generateLayout(params: {
    content: string;
    platform: string;
}): Promise<{
    content: string;
    previewHtml?: string; // 可选的HTML预览（用于公众号）
}> {
    let systemPrompt = '';

    if (params.platform === 'xiaohongshu') {
        systemPrompt = `你是小红书排版专家。请对文本进行"小红书味"的排版优化。
原则：
1. 增加大量Emoji，但不要杂乱
2. 关键信息加粗或用符号标注 (如 📌, 🌟)
3. 段落短小，增加空行
4. 结尾加上相关话题标签
5. 保持原文意思不变，只改排版和语气词

直接返回排版后的文本，不需要JSON格式。`;
    } else if (params.platform === 'wechat') {
        systemPrompt = `你是公众号排版专家。请将文本转换为适合手机阅读的Markdown结构。
原则：
1. 增加小标题 (##)
2. 重点句子加粗 (**text**)
3. 适当使用引用 (> quote) 强调金句
4. 段落之间增加空行
5. 保持专业和整洁

直接返回排版后的文本。`;
    } else {
        // 通用排版
        systemPrompt = `请美化这段文本的排版，使其更易读。增加分段和适当的Emoji。直接返回文本。`;
    }

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: params.content },
    ], { quality: 'medium', temperature: 0.5 });

    return { content: result };
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
    const systemPrompt = `作为专业内容策划师，为用户生成结构清晰的内容大纲。
返回JSON格式：{"title": "标题", "outline": ["点1", "点2"], "script": "脚本", "hashtags": ["标签"]}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `选题：${params.topic}，平台：${params.platform}，类型：${params.contentType}` },
    ], { quality: 'medium' });

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }
    return { title: params.topic, outline: [], hashtags: [] };
}

/**
 * AI优化标题 - 高质量版本
 */
export async function optimizeTitles(params: {
    title: string;
    platform: string;
}): Promise<{ title: string; score: number; style: string }[]> {
    const systemPrompt = `你是标题优化大师，专门创作高点击率标题。
为每个平台定制化优化，生成5个不同风格的高质量标题。

风格类型：
- curiosity: 好奇心驱动型
- benefit: 利益驱动型  
- emotion: 情感共鸣型
- urgency: 紧迫感型
- story: 故事型

返回JSON数组：[{"title": "标题", "score": 95, "style": "curiosity"}]`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `原标题：${params.title}，平台：${params.platform}` },
    ], { quality: 'high', temperature: 0.85 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }
    return [];
}

/**
 * AI助手对话 - 保持上下文连贯
 */
export async function assistantChat(
    messages: ChatMessage[],
    history: ChatMessage[] = []
): Promise<string> {
    const systemMessage: ChatMessage = {
        role: 'system',
        content: `你是SoloMedia的AI助手，帮助自媒体创作者提升内容质量和运营效率。

核心能力：
🎯 选题推荐 - 追踪热点，个性化推荐
✍️ 文案创作 - 标题、脚本、描述优化
📊 数据分析 - 解读数据，提供建议
💡 运营指导 - 回答运营问题

回答原则：
- 简洁精准，避免废话
- 给出具体可执行的建议
- 必要时使用emoji增加可读性
- 用中文回答`,
    };

    return chat([systemMessage, ...history, ...messages], {
        quality: 'medium',
        temperature: 0.7
    });
}

/**
 * 生成数据洞察 - 智能分析
 */
export async function generateInsights(data: {
    platforms: { name: string; views: number; followers: number }[];
    topContent: { title: string; views: number; engagement: number }[];
}): Promise<{ type: string; title: string; content: string; confidence: number }[]> {
    const systemPrompt = `作为数据分析专家，从运营数据中提取3条可执行洞察。
类型包括：timing(发布时机)、content(内容策略)、growth(增长建议)
返回JSON数组：[{"type": "timing", "title": "标题", "content": "建议", "confidence": 0.92}]`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(data) },
    ], { quality: 'medium', temperature: 0.6 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }
    return [];
}

/**
 * AI赛道雷达 - 智能分析
 */
export async function generateNicheAnalysis(params: {
    interests: string[];
    skills: string[];
    timeAvailable?: string;
}): Promise<{
    niche: string;
    difficulty: number; // 0-100
    potential: number; // 0-100
    reason: string;
}[]> {
    const systemPrompt = `你是自媒体赛道分析专家。基于用户兴趣和技能，推荐3个高潜力赛道。
分析维度：
1. 市场需求（热度）
2. 竞争程度（蓝海/红海）
3. 变现路径

返回JSON数组：
[
  {
    "niche": "赛道名称",
    "difficulty": 60,
    "potential": 85,
    "reason": "推荐理由，包含变现方式"
  }
]`;

    const userPrompt = `用户情况：
兴趣：${params.interests.join(', ')}
技能：${params.skills.join(', ')}
${params.timeAvailable ? `可用时间：${params.timeAvailable}` : ''}

请推荐3个适合新手的赛道。`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { quality: 'high', temperature: 0.8 });

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }

    // Fallback
    return [
        {
            niche: "生活Vlog",
            difficulty: 30,
            potential: 70,
            reason: "门槛低，适合新手起步，容易积累粉丝，变现靠广告"
        }
    ];
}

/**
 * AI内容DNA - 账号定位
 */
export async function generateContentDNA(params: {
    niche: string;
}): Promise<{
    persona: string;
    visualStyle: string;
    voice: string;
    bio: string;
}> {
    const systemPrompt = `你是品牌定位专家。为自媒体账号生成"内容DNA"。
返回JSON对象：
{
  "persona": "人设标签（如：省钱达人/硬核极客）",
  "visualStyle": "视觉风格（如：高饱和度/极简冷淡）",
  "voice": "语言风格（如：犀利吐槽/温柔治愈）",
  "bio": "一句话简介（吸引关注）"
}`;

    const result = await chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `赛道：${params.niche}` },
    ], { quality: 'medium' });

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch { }

    return {
        persona: "内容创作者",
        visualStyle: "清晰明亮",
        voice: "真诚分享",
        bio: "分享有价值的内容"
    };
}


/**
 * AI图像生成 - 通义万相 (Tongyi Wanxiang)
 * 文档: https://help.aliyun.com/document_detail/2712529.html
 */
export async function generateImage(params: {
    prompt: string;
    style?: string; // e.g., "<3d cartoon>" or "<cyberpunk>"
    size?: '1024*1024' | '720*1280' | '1280*720';
}): Promise<{ url: string } | null> {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error('DASHSCOPE_API_KEY 未设置');

    const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

    // 构造Prompt，通义万相支持风格修饰词
    const fullPrompt = params.style
        ? `${params.style}, ${params.prompt}, high quality, detailed`
        : `${params.prompt}, high quality, detailed`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable', // 异步提交
            },
            body: JSON.stringify({
                model: 'wanx-v1',
                input: {
                    prompt: fullPrompt
                },
                parameters: {
                    style: params.style || '<auto>',
                    size: params.size || '1024*1024',
                    n: 1
                }
            })
        });

        const data = await response.json();

        // 简单处理：如果是异步任务，通常需要轮询。这里简化为直接返回task_id，
        // 实际生产环境需要实现 Polling 机制。
        // 但 Tongyi Wanxiang V1 也支持同步调用（不加Async头）？
        // 修正：万相 V1 推荐异步，但也支持同步等待（如果不加header）。
        // 尝试同步调用（不加 X-DashScope-Async）：
        // 注意：Fetch API 在 Node 环境需要 polyfill (Next.js 16 自带，Shared package可能需要 node-fetch)
        // 假设运行环境支持 fetch (Node 18+)

        if (data.output && data.output.task_status === 'SUCCEEDED') {
            // 同步返回的情况
            return { url: data.output.results[0].url };
        } else if (data.output && data.output.task_id) {
            // 异步返回的情况，需要轮询
            return await pollTaskResult(data.output.task_id, apiKey);
        } else if (response.status !== 200) {
            console.error('Wanxiang Error:', data);
        }

    } catch (e) {
        console.error('generateImage failed:', e);
    }
    return null;
}

async function pollTaskResult(taskId: string, apiKey: string): Promise<{ url: string } | null> {
    const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

    // 轮询 30 秒
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 3000)); // Wait 3s
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await res.json();
            if (data.output && data.output.task_status === 'SUCCEEDED') {
                return { url: data.output.results[0].url };
            } else if (data.output && data.output.task_status === 'FAILED') {
                console.error('Task failed:', data);
                return null;
            }
        } catch (e) { console.error('Polling error:', e); }
    }
    return null;
}

/**
 * AI语音生成 - CosyVoice (通过阿里云语音合成API)
 * 简化版: 使用 Sambert 或 CosyVoice 接口
 */
export async function generateSpeech(params: {
    text: string;
    voice?: string; // e.g., "zhiyan_emo"
}): Promise<ArrayBuffer | null> {
    // 这是一个 Mock 实现的占位符，因为 Speech API 通常需要 WebSocket 或复杂的 REST 流程
    // 实际应调用: https://dashscope.aliyuncs.com/api/v1/services/audio/tts/generation
    console.log('Generating speech for:', params.text);
    return null;
}
