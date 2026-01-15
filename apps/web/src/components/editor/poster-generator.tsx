'use client';

import { useRef, useState, useCallback } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';

interface PosterTemplate {
    id: string;
    name: string;
    width: number;
    height: number;
    background: string;
    style?: React.CSSProperties;
}

const templates: PosterTemplate[] = [
    {
        id: 'xiaohongshu',
        name: '小红书封面',
        width: 1080,
        height: 1440,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        id: 'douyin',
        name: '抖音封面',
        width: 1080,
        height: 1920,
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    },
    {
        id: 'bilibili',
        name: 'B站封面',
        width: 1146,
        height: 717,
        background: 'linear-gradient(135deg, #00a1d6 0%, #fb7299 100%)',
    },
    {
        id: 'wechat',
        name: '公众号封面',
        width: 900,
        height: 383,
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
];

interface PosterGeneratorProps {
    title?: string;
    subtitle?: string;
    author?: string;
    onGenerate?: (dataUrl: string) => void;
}

export function PosterGenerator({
    title = '标题文字',
    subtitle = '副标题描述',
    author = '作者名',
    onGenerate,
}: PosterGeneratorProps) {
    const posterRef = useRef<HTMLDivElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>(templates[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editableTitle, setEditableTitle] = useState(title);
    const [editableSubtitle, setEditableSubtitle] = useState(subtitle);

    const generateImage = useCallback(async (format: 'png' | 'jpeg' = 'png') => {
        if (!posterRef.current) return;

        setIsGenerating(true);
        try {
            const options = {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
            };

            const dataUrl = format === 'png'
                ? await toPng(posterRef.current, options)
                : await toJpeg(posterRef.current, options);

            onGenerate?.(dataUrl);

            // 触发下载
            const link = document.createElement('a');
            link.download = `poster-${selectedTemplate.id}-${Date.now()}.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('生成海报失败:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedTemplate, onGenerate]);

    // 预览尺寸（缩小显示）
    const previewScale = 0.25;
    const previewWidth = selectedTemplate.width * previewScale;
    const previewHeight = selectedTemplate.height * previewScale;

    return (
        <div className="space-y-4">
            {/* 模板选择 */}
            <div className="flex gap-2 flex-wrap">
                {templates.map((template) => (
                    <Button
                        key={template.id}
                        variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                    >
                        {template.name}
                    </Button>
                ))}
            </div>

            {/* 海报预览 */}
            <Card className="p-4 overflow-auto">
                <div
                    ref={posterRef}
                    style={{
                        width: previewWidth,
                        height: previewHeight,
                        background: selectedTemplate.background,
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        ...selectedTemplate.style,
                    }}
                    className="mx-auto"
                >
                    {/* 内容区域 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white text-center">
                        {/* 标题 */}
                        <input
                            type="text"
                            value={editableTitle}
                            onChange={(e) => setEditableTitle(e.target.value)}
                            className="bg-transparent text-center font-bold outline-none w-full"
                            style={{
                                fontSize: `${previewScale * 48}px`,
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            placeholder="输入标题"
                        />

                        {/* 副标题 */}
                        <input
                            type="text"
                            value={editableSubtitle}
                            onChange={(e) => setEditableSubtitle(e.target.value)}
                            className="bg-transparent text-center outline-none w-full mt-2 opacity-90"
                            style={{
                                fontSize: `${previewScale * 24}px`,
                                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            }}
                            placeholder="输入副标题"
                        />

                        {/* 作者 */}
                        <div
                            className="absolute bottom-4 opacity-70"
                            style={{ fontSize: `${previewScale * 18}px` }}
                        >
                            @{author}
                        </div>
                    </div>
                </div>

                {/* 尺寸提示 */}
                <p className="text-center text-xs text-muted-foreground mt-2">
                    {selectedTemplate.width} × {selectedTemplate.height}px
                </p>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-2 justify-center">
                <Button
                    onClick={() => generateImage('png')}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    下载PNG
                </Button>
                <Button
                    variant="outline"
                    onClick={() => generateImage('jpeg')}
                    disabled={isGenerating}
                >
                    下载JPEG
                </Button>
            </div>
        </div>
    );
}

export default PosterGenerator;
