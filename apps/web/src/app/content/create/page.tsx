'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { RichEditor } from '@/components/editor/rich-editor';
import { PosterGenerator } from '@/components/editor/poster-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Wand2, Save, Send, ArrowLeft, Image,
    Video, FileText, Sparkles, Check, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// 平台选项... (不变)
const platforms = [
    { id: 'douyin', name: '抖音', icon: '🎵', color: 'bg-black' },
    { id: 'xiaohongshu', name: '小红书', icon: '📕', color: 'bg-red-500' },
    { id: 'bilibili', name: 'B站', icon: '📺', color: 'bg-blue-400' },
    { id: 'wechat', name: '公众号', icon: '💬', color: 'bg-green-500' },
];

export default function CreateContentPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['douyin']);
    const [contentType, setContentType] = useState<'video' | 'image' | 'article'>('video');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [contentId, setContentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('editor');

    const handlePlatformToggle = (platformId: string) => {
        // ... (不变)
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleAIGenerate = async () => {
        // ... (不变)
        if (!title) {
            toast.error('请先输入标题/选题');
            return;
        }

        setIsGenerating(true);
        // 模拟AI生成
        setTimeout(() => {
            setContent(`
<h2>📌 ${title}</h2>
<p>大家好，今天给大家分享一个超级实用的内容～</p>

<h3>✨ 核心要点</h3>
<ul>
  <li>第一点：这是AI为你生成的内容框架</li>
  <li>第二点：你可以根据需要进行修改和补充</li>
  <li>第三点：添加你的个人见解让内容更有价值</li>
</ul>

<h3>💡 实用建议</h3>
<p>记得在发布前检查内容是否完整，标题是否吸引人！</p>

<p><strong>关注我，获取更多优质内容～</strong></p>
      `.trim());
            setIsGenerating(false);
            toast.success('AI生成完成');
        }, 1500);
    };

    const handleSave = async (showToast = true) => {
        if (!title) {
            toast.error('请输入内容标题');
            return null;
        }

        setIsSaving(true);
        try {
            const data = {
                title,
                body: content,
                type: contentType,
                platforms: selectedPlatforms,
            };

            let res;
            if (contentId) {
                res = await api.content.update(contentId, data);
            } else {
                res = await api.content.create(data);
            }

            if (res.success && res.data) {
                setContentId(res.data.id);
                if (showToast) toast.success('草稿已保存');
                return res.data.id;
            } else {
                toast.error(res.error || '保存失败');
                return null;
            }
        } catch (error) {
            toast.error('保存出错');
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (selectedPlatforms.length === 0) {
            toast.error('请至少选择一个发布平台');
            return;
        }

        // 先保存
        const savedId = await handleSave(false);
        if (!savedId) return;

        setIsPublishing(true);
        try {
            const res = await api.content.publish(savedId, selectedPlatforms as any);
            if (res.success) {
                toast.success('发布任务已提交');
                // 可以在这里显示发布结果详情 (results)
                setTimeout(() => router.push('/content'), 1000);
            } else {
                toast.error(res.error || '发布请求失败');
            }
        } catch (error) {
            toast.error('发布出错');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* 顶部导航 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/content">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">创建新内容</h1>
                            <p className="text-muted-foreground">使用AI助手快速创作优质内容</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving || isPublishing}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {isSaving ? '保存中...' : '保存草稿'}
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            onClick={handlePublish}
                            disabled={isSaving || isPublishing}
                        >
                            {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            {isPublishing ? '发布中...' : '发布'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左侧 - 主编辑区 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 标题输入 */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="输入标题或选题..."
                                            className="text-lg font-medium"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                        <Button
                                            onClick={handleAIGenerate}
                                            disabled={isGenerating}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                        >
                                            <Wand2 className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                            {isGenerating ? 'AI生成中...' : 'AI生成'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 编辑区域标签页 */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="editor">
                                    <FileText className="h-4 w-4 mr-2" />
                                    内容编辑
                                </TabsTrigger>
                                <TabsTrigger value="cover">
                                    <Image className="h-4 w-4 mr-2" />
                                    封面设计
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="editor" className="mt-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <RichEditor
                                            content={content}
                                            onChange={setContent}
                                            placeholder="开始创作你的内容，或使用AI生成初稿..."
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="cover" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            封面生成器
                                        </CardTitle>
                                        <CardDescription>
                                            选择模板并自定义封面内容，一键生成多平台封面图
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PosterGenerator
                                            title={title || '输入你的标题'}
                                            subtitle="精心整理的超实用分享"
                                            author="创作者"
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 右侧 - 设置面板 */}
                    <div className="space-y-6">
                        {/* 内容类型 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">内容类型</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'video', icon: Video, label: '视频' },
                                        { id: 'image', icon: Image, label: '图文' },
                                        { id: 'article', icon: FileText, label: '文章' },
                                    ].map(type => (
                                        <Button
                                            key={type.id}
                                            variant={contentType === type.id ? 'default' : 'outline'}
                                            className={`flex flex-col h-20 ${contentType === type.id ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                                            onClick={() => setContentType(type.id as any)}
                                        >
                                            <type.icon className="h-5 w-5 mb-1" />
                                            <span className="text-xs">{type.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 发布平台 */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">发布平台</CardTitle>
                                <CardDescription className="text-xs">选择要发布的平台</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {platforms.map(platform => (
                                        <div
                                            key={platform.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPlatforms.includes(platform.id)
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                                                : 'hover:bg-muted'
                                                }`}
                                            onClick={() => handlePlatformToggle(platform.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{platform.icon}</span>
                                                <span className="font-medium">{platform.name}</span>
                                            </div>
                                            {selectedPlatforms.includes(platform.id) && (
                                                <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI建议 */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    AI建议
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-0.5">时间</Badge>
                                        <span className="text-muted-foreground">周六晚上8点发布效果最佳</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 mt-0.5">标题</Badge>
                                        <span className="text-muted-foreground">建议使用数字和emoji增加吸引力</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 mt-0.5">热点</Badge>
                                        <span className="text-muted-foreground">春节相关话题热度上升200%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
