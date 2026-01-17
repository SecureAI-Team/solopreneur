'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Copy, Check, ExternalLink, Sparkles,
    AlertCircle, Hash, Smile
} from 'lucide-react';
import { toast } from 'sonner';

interface CopyToPlatformProps {
    title: string;
    content: string;
    tags?: string[];
    coverImage?: string;
}

const platforms = [
    {
        id: 'douyin',
        name: '抖音',
        icon: '🎵',
        color: 'bg-black',
        maxLength: 5000,
        tagFormat: '#',
        webUrl: 'https://creator.douyin.com',
        tips: '打开抖音创作服务平台发布',
    },
    {
        id: 'xiaohongshu',
        name: '小红书',
        icon: '📕',
        color: 'bg-red-500',
        maxLength: 1000,
        tagFormat: '#话题 ',
        webUrl: 'https://creator.xiaohongshu.com',
        tips: '打开小红书创作者中心发布笔记',
    },
    {
        id: 'bilibili',
        name: 'B站',
        icon: '📺',
        color: 'bg-blue-400',
        maxLength: 10000,
        tagFormat: '#',
        webUrl: 'https://member.bilibili.com',
        tips: '打开B站创作中心投稿',
    },
    {
        id: 'wechat',
        name: '微信公众号',
        icon: '💬',
        color: 'bg-green-500',
        maxLength: null,
        tagFormat: null,
        webUrl: 'https://mp.weixin.qq.com',
        tips: '打开微信公众平台发布文章',
    },
    {
        id: 'zhihu',
        name: '知乎',
        icon: '🔵',
        color: 'bg-blue-600',
        maxLength: null,
        tagFormat: null,
        webUrl: 'https://www.zhihu.com/creator',
        tips: '打开知乎创作中心发布',
    },
    {
        id: 'toutiao',
        name: '头条号',
        icon: '📰',
        color: 'bg-red-600',
        maxLength: null,
        tagFormat: '#',
        webUrl: 'https://mp.toutiao.com',
        tips: '打开头条号发布',
    },
];

export function CopyToPlatform({ title, content, tags = [] }: CopyToPlatformProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [copied, setCopied] = useState<'title' | 'content' | 'all' | null>(null);

    const formatContentForPlatform = (platformId: string) => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform) return { formattedTitle: title, formattedContent: content };

        let formattedContent = content;

        // Add tags if platform supports them
        if (platform.tagFormat && tags.length > 0) {
            const formattedTags = tags.map(tag =>
                `${platform.tagFormat}${tag.replace(/^#/, '')}`
            ).join(' ');
            formattedContent = `${formattedContent}\n\n${formattedTags}`;
        }

        // Truncate if exceeds max length
        if (platform.maxLength && formattedContent.length > platform.maxLength) {
            formattedContent = formattedContent.slice(0, platform.maxLength - 3) + '...';
        }

        return {
            formattedTitle: title,
            formattedContent,
            charCount: formattedContent.length,
            maxLength: platform.maxLength,
        };
    };

    const handleCopy = async (type: 'title' | 'content' | 'all') => {
        if (!selectedPlatform) {
            toast.error('请先选择目标平台');
            return;
        }

        const { formattedTitle, formattedContent } = formatContentForPlatform(selectedPlatform);

        let textToCopy = '';
        if (type === 'title') {
            textToCopy = formattedTitle;
        } else if (type === 'content') {
            textToCopy = formattedContent;
        } else {
            textToCopy = `${formattedTitle}\n\n${formattedContent}`;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);

            // Sync to extension via window message
            window.postMessage({
                type: 'SOLOMEDIA_SYNC_CONTENT',
                payload: {
                    title: formattedTitle,
                    content: formattedContent,
                    platforms: [selectedPlatform]
                }
            }, '*');

            setCopied(type);
            toast.success('已复制，并同步到助手扩展');
            setTimeout(() => setCopied(null), 2000);
        } catch (e) {
            toast.error('复制失败，请手动选择复制');
        }
    };

    const handleOpenPlatform = () => {
        if (!selectedPlatform) return;
        const platform = platforms.find(p => p.id === selectedPlatform);
        if (platform?.webUrl) {
            window.open(platform.webUrl, '_blank');
        }
    };

    const selectedPlatformInfo = selectedPlatform
        ? platforms.find(p => p.id === selectedPlatform)
        : null;

    const formattedData = selectedPlatform
        ? formatContentForPlatform(selectedPlatform)
        : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Copy className="size-5" />
                    复制发布到平台
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {platforms.map((platform) => (
                        <button
                            key={platform.id}
                            className={`p-3 rounded-xl border text-center transition-all ${selectedPlatform === platform.id
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                                : 'hover:bg-muted/50'
                                }`}
                            onClick={() => setSelectedPlatform(platform.id)}
                        >
                            <div className={`size-10 mx-auto rounded-lg ${platform.color} flex items-center justify-center text-xl mb-1`}>
                                {platform.icon}
                            </div>
                            <p className="text-xs font-medium truncate">{platform.name}</p>
                        </button>
                    ))}
                </div>

                {/* Preview & Copy */}
                {selectedPlatform && formattedData && (
                    <div className="space-y-3 pt-3 border-t">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>字数: {formattedData.charCount}</span>
                            {formattedData.maxLength && (
                                <span className={formattedData.charCount > formattedData.maxLength ? 'text-red-500' : ''}>
                                    限制: {formattedData.maxLength}
                                </span>
                            )}
                            {tags.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Hash className="size-3" />
                                    {tags.length} 个标签
                                </span>
                            )}
                        </div>

                        {/* Warning if too long */}
                        {formattedData.maxLength && formattedData.charCount > formattedData.maxLength && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 text-sm">
                                <AlertCircle className="size-4" />
                                内容超出平台限制，已自动截断
                            </div>
                        )}

                        {/* Content Preview */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">标题</label>
                            <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                {formattedData.formattedTitle || '(无标题)'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">正文</label>
                            <Textarea
                                value={formattedData.formattedContent}
                                readOnly
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        {/* Copy Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleCopy('title')}
                            >
                                {copied === 'title' ? <Check className="size-4" /> : <Copy className="size-4" />}
                                复制标题
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleCopy('content')}
                            >
                                {copied === 'content' ? <Check className="size-4" /> : <Copy className="size-4" />}
                                复制正文
                            </Button>
                            <Button
                                size="sm"
                                className="gap-1 bg-violet-600 hover:bg-violet-700"
                                onClick={() => handleCopy('all')}
                            >
                                {copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
                                复制全部
                            </Button>
                        </div>

                        {/* Open Platform */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 text-sm">
                                <Sparkles className="size-4 text-violet-500" />
                                {selectedPlatformInfo?.tips}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={handleOpenPlatform}
                            >
                                打开{selectedPlatformInfo?.name}
                                <ExternalLink className="size-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!selectedPlatform && (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>👆 选择一个平台开始复制发布</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
