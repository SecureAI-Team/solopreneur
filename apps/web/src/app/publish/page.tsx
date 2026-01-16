'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CalendarDays, Clock, Send, Plus, CheckCircle2,
    AlertCircle, Timer, TrendingUp, Eye, Heart, Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

function formatNumber(num: number): string {
    if (!num) return '0';
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万"
    }
    return num.toLocaleString()
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'scheduled':
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">已排期</Badge>;
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">待确认</Badge>;
        case 'draft':
            return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">草稿</Badge>;
        case 'published': // Changed from success to match likely DB status
        case 'success':
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">已发布</Badge>;
        case 'failed':
            return <Badge variant="destructive">失败</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function PublishPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            // Fetch all content for now, ideally filter by type='published' or similar
            const res = await api.content.list();
            if (res.success) {
                setPosts(res.data || []);
            }
        } catch (e) {
            console.error(e);
            toast.error("加载发布记录失败");
        } finally {
            setLoading(false);
        }
    };

    // Derived states
    // In a real app these should be backend queries
    const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'pending');
    const publishedPosts = posts.filter(p => p.status === 'published' || p.status === 'success');

    // Stats
    const weekCount = publishedPosts.length; // Mock: assume all are this week for MVP
    const pendingCount = scheduledPosts.length;
    const totalCount = posts.filter(p => p.status === 'published').length;

    const publishStats = [
        { label: "本周已发布", value: weekCount.toString(), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100" },
        { label: "待发布", value: pendingCount.toString(), icon: Timer, color: "text-blue-500", bg: "bg-blue-100" },
        { label: "发布失败", value: "0", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-100" },
        { label: "总发布", value: totalCount.toString(), icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-100" },
    ]

    return (
        <DashboardLayout title="发布中心" breadcrumbs={[{ label: "发布中心" }]}>
            <div className="space-y-6">
                {/* 顶部操作栏 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">发布中心</h2>
                        <p className="text-muted-foreground">管理和调度你的内容发布</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/content/create">
                            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                <Plus className="size-4" />
                                新建发布
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {publishStats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`size-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* 待发布/最新发布列表 */}
                        <Card className="lg:col-span-3">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>发布记录</CardTitle>
                                    <CardDescription>查看所有内容的发布状态</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {posts.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        暂无发布记录，快去创作吧！
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all bg-card"
                                            >
                                                <div className="size-14 rounded-xl bg-muted flex items-center justify-center text-lg">
                                                    {post.type === 'video' ? '🎬' : '📝'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{post.title || '无标题'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {/* Safely parse platforms - could be array, JSON string, or comma-separated string */}
                                                        {(() => {
                                                            let platformList: string[] = [];
                                                            if (Array.isArray(post.platforms)) {
                                                                platformList = post.platforms;
                                                            } else if (typeof post.platforms === 'string' && post.platforms) {
                                                                try {
                                                                    platformList = JSON.parse(post.platforms);
                                                                } catch {
                                                                    // Not valid JSON, might be comma-separated or single value
                                                                    platformList = post.platforms.split(',').map((s: string) => s.trim());
                                                                }
                                                            }
                                                            return platformList.length > 0 ? (
                                                                <span className="text-sm text-muted-foreground">
                                                                    发布至: {platformList.join(', ')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">未选择平台</span>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Clock className="size-3" />
                                                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {post.status === 'published' && (
                                                        <div className="flex gap-3 text-sm text-muted-foreground mr-2">
                                                            <span className="flex items-center"><Eye className="size-3 mr-1" /> {formatNumber(Math.floor(Math.random() * 5000))}</span>
                                                            <span className="flex items-center"><Heart className="size-3 mr-1 text-pink-500" /> {formatNumber(Math.floor(Math.random() * 200))}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1">
                                                        {getStatusBadge(post.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
