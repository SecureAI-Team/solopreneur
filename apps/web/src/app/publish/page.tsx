'use client';

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CalendarDays, Clock, Send, MoreHorizontal, Plus,
    CheckCircle2, AlertCircle, Timer, TrendingUp,
    Eye, Heart
} from "lucide-react"

const scheduledPosts = [
    {
        id: "1",
        title: "2026春节回家必备好物清单",
        platforms: [
            { name: "小红书", icon: "📕", status: "scheduled" },
            { name: "抖音", icon: "🎵", status: "scheduled" },
        ],
        scheduledTime: "2026-01-16 10:00",
        thumbnail: "🎁",
    },
    {
        id: "2",
        title: "5分钟早餐合集第9期",
        platforms: [
            { name: "抖音", icon: "🎵", status: "scheduled" },
            { name: "B站", icon: "📺", status: "draft" },
        ],
        scheduledTime: "2026-01-17 08:00",
        thumbnail: "🍳",
    },
    {
        id: "3",
        title: "年终总结：我的2025",
        platforms: [
            { name: "B站", icon: "📺", status: "scheduled" },
            { name: "公众号", icon: "💬", status: "pending" },
        ],
        scheduledTime: "2026-01-18 20:00",
        thumbnail: "✨",
    },
]

const recentPublished = [
    {
        id: "1",
        title: "冬季护肤必备单品推荐",
        platform: "小红书",
        platformIcon: "📕",
        publishedAt: "2026-01-14 10:30",
        views: 12500,
        likes: 856,
        status: "success",
    },
    {
        id: "2",
        title: "5分钟早餐合集第8期",
        platform: "抖音",
        platformIcon: "🎵",
        publishedAt: "2026-01-13 08:00",
        views: 28000,
        likes: 2340,
        status: "success",
    },
    {
        id: "3",
        title: "冬日穿搭分享",
        platform: "小红书",
        platformIcon: "📕",
        publishedAt: "2026-01-12 18:00",
        views: 8600,
        likes: 520,
        status: "success",
    },
]

const publishStats = [
    { label: "本周已发布", value: "8", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100" },
    { label: "待发布", value: "3", icon: Timer, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "草稿箱", value: "5", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-100" },
    { label: "总发布", value: "126", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-100" },
]

function formatNumber(num: number): string {
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
        case 'success':
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">已发布</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function PublishPage() {
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
                        <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                            <Plus className="size-4" />
                            新建发布
                        </Button>
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

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 待发布内容 */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>待发布内容</CardTitle>
                                <CardDescription>已排期和待确认的内容</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">查看全部</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {scheduledPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
                                    >
                                        <div className="size-14 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900 dark:to-indigo-900 flex items-center justify-center text-2xl">
                                            {post.thumbnail}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{post.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {post.platforms.map((p, i) => (
                                                    <span key={i} className="text-sm flex items-center gap-1">
                                                        {p.icon} {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <Clock className="size-3" />
                                                <span>{post.scheduledTime}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex gap-1">
                                                {post.platforms.map((p, i) => (
                                                    <span key={i}>{getStatusBadge(p.status)}</span>
                                                ))}
                                            </div>
                                            <Button variant="outline" size="sm">
                                                编辑
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 发布日历 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="size-5" />
                                本周发布计划
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {['周四 1/16', '周五 1/17', '周六 1/18'].map((day, i) => (
                                    <div key={day} className="p-3 rounded-lg border">
                                        <p className="font-medium text-sm">{day}</p>
                                        <div className="mt-2 space-y-1">
                                            {i === 0 && (
                                                <div className="text-xs p-2 rounded bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                                                    📕 春节好物清单 10:00
                                                </div>
                                            )}
                                            {i === 1 && (
                                                <div className="text-xs p-2 rounded bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                                    🎵 早餐合集 08:00
                                                </div>
                                            )}
                                            {i === 2 && (
                                                <div className="text-xs p-2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    📺 年终总结 20:00
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                查看完整日历
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* 最近发布 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>最近发布</CardTitle>
                            <CardDescription>过去7天发布的内容及表现</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">查看全部</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentPublished.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{post.platformIcon}</span>
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{post.platform}</span>
                                                <span>•</span>
                                                <span>{post.publishedAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Eye className="size-4 text-muted-foreground" />
                                                <span className="font-medium">{formatNumber(post.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="size-4 text-pink-500" />
                                                <span className="font-medium">{formatNumber(post.likes)}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(post.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
