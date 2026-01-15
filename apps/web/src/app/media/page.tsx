'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    FolderOpen, Upload, Image, Video, FileAudio, File,
    Search, Grid3X3, List, MoreHorizontal, Trash2, Download,
    Plus, Filter, SortDesc, CheckCircle, X, CloudUpload, Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

// 模拟素材数据 (初始数据)
const initialMediaItems = [
    { id: 1, name: '春节封面.png', type: 'image', size: '2.4MB', date: '2026-01-14', url: '', tags: ['封面', '春节'] },
    { id: 2, name: '产品展示.mp4', type: 'video', size: '45.2MB', date: '2026-01-13', url: '', tags: ['视频', '产品'] },
    { id: 3, name: '背景音乐.mp3', type: 'audio', size: '3.8MB', date: '2026-01-12', url: '', tags: ['音乐'] },
    { id: 4, name: '护肤分享.jpg', type: 'image', size: '1.8MB', date: '2026-01-11', url: '', tags: ['护肤', '分享'] },
    { id: 5, name: '早餐合集.png', type: 'image', size: '2.1MB', date: '2026-01-10', url: '', tags: ['美食', '封面'] },
    { id: 6, name: '穿搭展示.mp4', type: 'video', size: '38.6MB', date: '2026-01-09', url: '', tags: ['穿搭', '视频'] },
    { id: 7, name: '品牌Logo.svg', type: 'image', size: '0.2MB', date: '2026-01-08', url: '', tags: ['Logo', '品牌'] },
    { id: 8, name: '采访片段.mp4', type: 'video', size: '120MB', date: '2026-01-07', url: '', tags: ['采访', '素材'] },
];

const folders = [
    { name: '封面素材', count: 24, icon: '🎨' },
    { name: '视频素材', count: 18, icon: '🎬' },
    { name: '音频素材', count: 12, icon: '🎵' },
    { name: '品牌资源', count: 8, icon: '✨' },
];

const stats = [
    { label: '总素材', value: '156', unit: '个' },
    { label: '已用空间', value: '2.4', unit: 'GB' },
    { label: '本月上传', value: '23', unit: '个' },
];

function getFileIcon(type: string) {
    switch (type) {
        case 'image': return <Image className="size-5 text-blue-500" />;
        case 'video': return <Video className="size-5 text-purple-500" />;
        case 'audio': return <FileAudio className="size-5 text-orange-500" />;
        default: return <File className="size-5 text-gray-500" />;
    }
}

function getFileColor(type: string) {
    switch (type) {
        case 'image': return 'bg-blue-100 dark:bg-blue-900';
        case 'video': return 'bg-purple-100 dark:bg-purple-900';
        case 'audio': return 'bg-orange-100 dark:bg-orange-900';
        default: return 'bg-gray-100 dark:bg-gray-800';
    }
}

export default function MediaLibraryPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [items, setItems] = useState(initialMediaItems);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleSelect = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleUpload = async (file: File) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // 使用api.upload上传文件
            const response = await api.upload(file);

            if (response.success && response.data) {
                toast.success('上传成功');
                const newItem = {
                    id: Date.now(),
                    name: response.data.name.split('/').pop() || file.name,
                    type: file.type.split('/')[0], // simple type extraction
                    size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                    date: new Date().toISOString().split('T')[0],
                    url: response.data.url,
                    tags: ['新上传'],
                };
                setItems([newItem, ...items]);
            } else {
                toast.error(response.error || '上传失败');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('上传出错');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <DashboardLayout title="素材库" breadcrumbs={[{ label: "素材库" }]}>
            <div className="space-y-6">
                {/* 顶部操作栏 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">素材管理</h2>
                        <p className="text-muted-foreground">管理你的图片、视频和音频素材</p>
                    </div>
                    <Button
                        className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                        {isUploading ? '上传中...' : '上传素材'}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* 统计卡片 */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{stat.label}</span>
                                    <span className="text-3xl font-bold">
                                        {stat.value}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* 左侧：文件夹 */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FolderOpen className="size-4" />
                                    文件夹
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {folders.map((folder) => (
                                    <div
                                        key={folder.name}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{folder.icon}</span>
                                            <span className="font-medium">{folder.name}</span>
                                        </div>
                                        <Badge variant="secondary">{folder.count}</Badge>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                                    <Plus className="size-4" />
                                    新建文件夹
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 存储空间 */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>存储空间</span>
                                        <span className="text-muted-foreground">2.4 / 10 GB</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                                            style={{ width: '24%' }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">升级到专业版获取更多空间</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右侧：素材列表 */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* 搜索和筛选 */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="搜索素材..."
                                    className="pl-10 bg-muted/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <SortDesc className="size-4" />
                            </Button>
                            <div className="flex rounded-lg bg-muted p-1">
                                <button
                                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="size-4" />
                                </button>
                                <button
                                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="size-4" />
                                </button>
                            </div>
                        </div>

                        {/* 批量操作 */}
                        {selectedItems.length > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
                                <span className="text-sm font-medium">已选择 {selectedItems.length} 个素材</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Download className="size-3" />
                                        下载
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                                        <Trash2 className="size-3" />
                                        删除
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 拖拽上传区域 */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                                : 'border-muted hover:border-muted-foreground'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <div className="py-4">
                                    <Loader2 className="size-10 mx-auto mb-3 text-violet-500 animate-spin" />
                                    <p className="font-medium">正在上传...</p>
                                </div>
                            ) : (
                                <>
                                    <CloudUpload className={`size-10 mx-auto mb-3 ${isDragging ? 'text-violet-500' : 'text-muted-foreground'}`} />
                                    <p className="font-medium">拖拽文件到此处上传</p>
                                    <p className="text-sm text-muted-foreground mt-1">或点击上传按钮选择文件</p>
                                </>
                            )}
                        </div>

                        {/* 素材网格 */}
                        {viewMode === 'grid' ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selectedItems.includes(item.id) ? 'ring-2 ring-violet-500' : ''
                                            }`}
                                        onClick={() => toggleSelect(item.id)}
                                    >
                                        {/* 预览区 */}
                                        <div className={`aspect-square ${getFileColor(item.type)} flex items-center justify-center relative overflow-hidden`}>
                                            {item.type === 'image' && item.url ? (
                                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="size-16 rounded-xl bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shadow-lg">
                                                    {getFileIcon(item.type)}
                                                </div>
                                            )}
                                        </div>

                                        {/* 选中标记 */}
                                        {selectedItems.includes(item.id) && (
                                            <div className="absolute top-2 left-2 size-6 rounded-full bg-violet-600 flex items-center justify-center z-10">
                                                <CheckCircle className="size-4 text-white" />
                                            </div>
                                        )}

                                        {/* 更多操作 */}
                                        <button className="absolute top-2 right-2 size-8 rounded-full bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <MoreHorizontal className="size-4" />
                                        </button>

                                        {/* 信息 */}
                                        <div className="p-3 bg-white dark:bg-slate-900">
                                            <p className="font-medium truncate text-sm" title={item.name}>{item.name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-muted-foreground">{item.size}</span>
                                                <span className="text-xs text-muted-foreground">{item.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* 列表视图 */
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {filteredItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedItems.includes(item.id) ? 'bg-violet-50 dark:bg-violet-950' : ''
                                                    }`}
                                                onClick={() => toggleSelect(item.id)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-10 rounded-lg ${getFileColor(item.type)} flex items-center justify-center overflow-hidden`}>
                                                        {item.type === 'image' && item.url ? (
                                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getFileIcon(item.type)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <div className="flex gap-2 mt-0.5">
                                                            {item.tags.map(tag => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                    <span>{item.size}</span>
                                                    <span>{item.date}</span>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
