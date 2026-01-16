
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MessageSquare, CornerDownRight, ThumbsUp, MoreHorizontal, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Comment {
    id: string;
    platform: 'wechat' | 'douyin' | 'xiaohongshu' | 'bilibili';
    content: string;
    author: {
        name: string;
        avatar: string;
    };
    createdAt: string;
    isReplied: boolean;
    postTitle: string;
}

const platformConfig = {
    douyin: { icon: '🎵', color: 'bg-black text-white', label: '抖音' },
    xiaohongshu: { icon: '📕', color: 'bg-red-500 text-white', label: '小红书' },
    bilibili: { icon: '📺', color: 'bg-blue-400 text-white', label: 'B站' },
    wechat: { icon: '💬', color: 'bg-green-500 text-white', label: '公众号' },
};

export default function InboxPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const res = await api.comments.list();
            if (res.success) {
                setComments(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('加载评论失败');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (id: string) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: '发送回复...',
                success: '回复成功！(Mock)',
                error: '回复失败'
            }
        );
    };

    const filteredComments = activeFilter === 'all'
        ? comments
        : activeFilter === 'unread'
            ? comments.filter(c => !c.isReplied)
            : comments.filter(c => c.createdAt.includes(activeFilter)); // Temporary loose filter

    return (
        <DashboardLayout title="评论管理">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">统一收件箱</h1>
                        <p className="text-muted-foreground">聚合管理所有平台的评论与私信</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="搜索评论内容..." className="pl-9" />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setActiveFilter('all')}
                                    size="sm"
                                >
                                    全部
                                </Button>
                                <Button
                                    variant={activeFilter === 'unread' ? 'default' : 'outline'}
                                    onClick={() => setActiveFilter('unread')}
                                    size="sm"
                                >
                                    未回复
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-0 divide-y">
                                {filteredComments.map(comment => (
                                    <div key={comment.id} className="py-4 hover:bg-muted/50 transition-colors px-4 -mx-4">
                                        <div className="flex gap-4">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={comment.author.avatar} />
                                                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{comment.author.name}</span>
                                                        <Badge variant="secondary" className={`text-xs px-1.5 py-0 h-5 ${platformConfig[comment.platform].color}`}>
                                                            {platformConfig[comment.platform].icon} {platformConfig[comment.platform].label}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(comment.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <p className="text-sm text-foreground/90">{comment.content}</p>

                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded w-fit">
                                                    <span>来自帖子:</span>
                                                    <span className="font-medium text-foreground">{comment.postTitle}</span>
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                                                        <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                                                        赞
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleReply(comment.id)}
                                                    >
                                                        <CornerDownRight className="h-3.5 w-3.5 mr-1.5" />
                                                        回复
                                                    </Button>
                                                    {comment.isReplied && (
                                                        <span className="text-xs text-green-600 flex items-center ml-auto">
                                                            <MessageSquare className="h-3 w-3 mr-1" /> 已回复
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
