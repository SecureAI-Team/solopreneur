'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    FolderOpen, Upload, Image as ImageIcon, Video, FileAudio, File as FileIcon,
    Search, Grid3X3, List as ListIcon, MoreHorizontal, Trash2, Download,
    Plus, Filter, CheckCircle, X, CloudUpload, Loader2, Music, PlayCircle
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock folders (Client side local folders for now as no folder API yet)
const folders = [
    { name: '封面素材', count: 24, icon: '🎨', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { name: '视频素材', count: 18, icon: '🎬', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
    { name: '音频素材', count: 12, icon: '🎵', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { name: '品牌资源', count: 8, icon: '✨', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

function getFileIcon(type: string) {
    switch (type) {
        case 'image': return <ImageIcon className="size-8 text-blue-500" />;
        case 'video': return <Video className="size-8 text-purple-500" />;
        case 'audio': return <Music className="size-8 text-amber-500" />;
        default: return <FileIcon className="size-8 text-gray-400" />;
    }
}

function getFileColor(type: string) {
    switch (type) {
        case 'image': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600';
        case 'video': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600';
        case 'audio': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600';
        default: return 'bg-gray-50 dark:bg-gray-800 text-gray-500';
    }
}

export default function MediaLibraryPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [previewItem, setPreviewItem] = useState<any | null>(null);

    const fetchMedia = async () => {
        try {
            setIsLoading(true);
            const response = await api.upload.list();
            if (response.success && response.data) {
                const mappedItems = response.data.map((file: any, index: number) => {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    let type = 'file';
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) type = 'image';
                    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) type = 'video';
                    if (['mp3', 'wav'].includes(ext)) type = 'audio';

                    return {
                        id: index, // Using index as ID for now since API doesn't return ID
                        name: file.name.split('/').pop() || file.name,
                        originalName: file.name, // Keep full path for delete
                        type,
                        size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                        date: new Date(file.lastModified).toISOString().split('T')[0],
                        url: file.url,
                        tags: []
                    };
                });
                setItems(mappedItems);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
            toast.error('加载素材失败');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchMedia();
    }, []);

    const toggleSelect = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleUpload = async (file: File) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await api.upload.upload(file);

            if (response.success && response.data) {
                toast.success('上传成功');
                fetchMedia(); // Refresh list after upload
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

    const handleDelete = async () => {
        if (selectedItems.length === 0) return;

        if (!confirm('确定要删除选中的素材吗？此操作不可恢复。')) return;

        const itemsToDelete = items.filter(item => selectedItems.includes(item.id));

        try {
            for (const item of itemsToDelete) {
                await api.upload.delete(item.originalName);
            }
            toast.success('删除成功');
            setSelectedItems([]);
            fetchMedia();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('删除部分文件失败');
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

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <DashboardLayout title="素材库" breadcrumbs={[{ label: "素材库" }]}>
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
                {/* 左侧：文件夹与存储 */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-6 flex flex-col">
                    <div className="space-y-4 flex-1 lg:flex-none overflow-y-auto lg:overflow-visible pr-2 lg:pr-0">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">我的文件夹</h3>
                        <div className="space-y-1">
                            {folders.map((folder) => (
                                <button
                                    key={folder.name}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-8 rounded-lg flex items-center justify-center ${folder.color}`}>
                                            {folder.icon}
                                        </div>
                                        <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{folder.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700">
                                        {folder.count}
                                    </Badge>
                                </button>
                            ))}
                            <button className="w-full flex items-center gap-3 p-2 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300">
                                <div className="size-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                    <Plus className="size-4" />
                                </div>
                                <span className="text-sm">新建文件夹</span>
                            </button>
                        </div>
                    </div>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white overflow-hidden relative shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CloudUpload className="size-24" />
                        </div>
                        <CardContent className="pt-6 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-medium opacity-90">
                                    <span>云端存储</span>
                                    <span>2.4GB / 10GB</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div className="h-full bg-white rounded-full w-[24%]" />
                                </div>
                                <Button size="sm" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-none backdrop-blur-md">
                                    升级扩容
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧：素材主区域 */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 md:p-6 overflow-hidden">
                    <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0" onValueChange={setActiveTab}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
                                <TabsTrigger value="all" className="px-4">全部</TabsTrigger>
                                <TabsTrigger value="image" className="px-4">图片</TabsTrigger>
                                <TabsTrigger value="video" className="px-4">视频</TabsTrigger>
                                <TabsTrigger value="audio" className="px-4">音频</TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="搜索素材..."
                                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex border rounded-lg bg-slate-50 dark:bg-slate-800 p-0.5">
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3X3 className="size-4" />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <ListIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {selectedItems.length > 0 && (
                            <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 animate-in fade-in slide-in-from-top-2 shrink-0">
                                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                                    <CheckCircle className="size-4" />
                                    <span className="text-sm font-medium">已选择 {selectedItems.length} 项</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" className="h-8 hover:bg-violet-100 dark:hover:bg-violet-800 text-violet-700 dark:text-violet-300">
                                        <Download className="size-3.5 mr-1.5" />
                                        下载
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="size-3.5 mr-1.5" />
                                        删除
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedItems([])}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar min-h-0"
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            {isDragging ? (
                                <div className="h-full border-2 border-dashed border-violet-500 rounded-xl bg-violet-50/50 dark:bg-violet-900/20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                                    <CloudUpload className="size-20 text-violet-500 mb-6 animate-bounce" />
                                    <h3 className="text-2xl font-bold text-violet-700 dark:text-violet-300 mb-2">释放以上传文件</h3>
                                    <p className="text-muted-foreground">支持图片、视频、音频格式</p>
                                </div>
                            ) : (
                                <TabsContent value={activeTab} className="mt-0 h-full p-1 pb-10 focus-visible:ring-0 outline-none block data-[state=inactive]:hidden">
                                    {/* This container ensures internal structure */}
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 content-start pb-4">
                                            {/* Upload Card */}
                                            <button
                                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex flex-col items-center justify-center gap-3 transition-all group"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                <div className="size-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {isUploading ? <Loader2 className="size-6 text-violet-500 animate-spin" /> : <Upload className="size-6 text-violet-500" />}
                                                </div>
                                                <span className="text-sm font-medium text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400">
                                                    {isUploading ? '正在上传...' : '上传新素材'}
                                                </span>
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                                            {/* Media Items */}
                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`group relative aspect-square rounded-2xl border bg-white dark:bg-slate-800 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${selectedItems.includes(item.id) ? 'ring-2 ring-violet-500 border-transparent' : 'border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    onClick={() => toggleSelect(item.id)}
                                                >
                                                    {/* Preview */}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                                        {item.type === 'image' && item.url ? (
                                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className={`p-6 rounded-3xl ${getFileColor(item.type)}`}>
                                                                {getFileIcon(item.type)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Overlay */}
                                                    <div className={`absolute inset-0 bg-black/40 transition-opacity flex flex-col justify-between p-3 ${selectedItems.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                        }`}>
                                                        <div className="flex justify-between">
                                                            <div className={`size-6 rounded-full border-2 border-white flex items-center justify-center ${selectedItems.includes(item.id) ? 'bg-violet-500 border-violet-500' : 'bg-transparent'}`}>
                                                                {selectedItems.includes(item.id) && <CheckCircle className="size-3 text-white" />}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    className="size-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                                                                    title="预览"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPreviewItem(item);
                                                                    }}
                                                                >
                                                                    <PlayCircle className="size-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                                            <p className="text-white/80 text-xs">{item.size}</p>
                                                        </div>
                                                    </div>

                                                    {/* Badge for Video/Audio duration (Mock) */}
                                                    {(item.type === 'video' || item.type === 'audio') && (
                                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                                                            02:14
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pb-4">
                                            {/* List Header */}
                                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b mb-2 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                                <div className="w-10"></div>
                                                <div>名称</div>
                                                <div className="w-24">大小</div>
                                                <div className="w-32">上传时间</div>
                                            </div>

                                            <button
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed hover:bg-violet-50 dark:hover:bg-violet-900/20 text-muted-foreground hover:text-violet-600 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                                                </div>
                                                <span className="font-medium">上传新素材</span>
                                            </button>

                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${selectedItems.includes(item.id)
                                                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-sm'
                                                        }`}
                                                    onClick={() => toggleSelect(item.id)}
                                                >
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <div className={`size-5 rounded border flex items-center justify-center cursor-pointer ${selectedItems.includes(item.id) ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300'}`} onClick={() => toggleSelect(item.id)}>
                                                            {selectedItems.includes(item.id) && <CheckCircle className="size-3" />}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`size-10 flex-shrink-0 rounded-lg ${getFileColor(item.type)} flex items-center justify-center overflow-hidden`}>
                                                            {item.type === 'image' && item.url ? (
                                                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                getFileIcon(item.type)
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 text-left">
                                                            <p className="font-medium truncate">{item.name}</p>
                                                            <div className="flex gap-2">
                                                                {item.tags.map(tag => (
                                                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground w-24">{item.size}</div>
                                                    <div className="text-sm text-muted-foreground w-32">{item.date}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>

                <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
                    <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black/95 border-slate-800">
                        <DialogHeader className="absolute top-4 right-4 z-50">
                            <DialogTitle className="hidden">Preview</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-[80vh] flex items-center justify-center">
                            {previewItem && (
                                <>
                                    {previewItem.type === 'image' && (
                                        <img
                                            src={previewItem.url || "/placeholder-image.jpg"}
                                            alt={previewItem.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    )}
                                    {previewItem.type === 'video' && (
                                        <video
                                            src={previewItem.url}
                                            controls
                                            className="max-w-full max-h-full"
                                            autoPlay
                                        >
                                            您的浏览器不支持视频播放
                                        </video>
                                    )}
                                    {previewItem.type === 'audio' && (
                                        <div className="bg-slate-900 p-12 rounded-2xl flex flex-col items-center gap-6">
                                            <div className="size-32 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                                                <Music className="size-16 text-amber-500" />
                                            </div>
                                            <audio src={previewItem.url} controls className="w-64" />
                                            <p className="text-slate-300 font-medium">{previewItem.name}</p>
                                        </div>
                                    )}
                                    {!['image', 'video', 'audio'].includes(previewItem.type) && (
                                        <div className="text-center text-slate-400">
                                            <FileIcon className="size-20 mx-auto mb-4 opacity-50" />
                                            <p>此文件类型不支持预览</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {previewItem && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <h3 className="font-semibold text-lg">{previewItem.name}</h3>
                                <p className="text-sm text-slate-300">{previewItem.size} • {previewItem.date}</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
