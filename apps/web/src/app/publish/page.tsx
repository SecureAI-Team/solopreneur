import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Send, MoreHorizontal } from "lucide-react"

const scheduledPosts = [
    {
        id: "1",
        title: "2026春节回家必备好物清单",
        platform: "小红书",
        platformIcon: "📕",
        scheduledTime: "2026-01-16 10:00",
        status: "scheduled",
    },
    {
        id: "2",
        title: "5分钟早餐合集第9期",
        platform: "抖音",
        platformIcon: "🎵",
        scheduledTime: "2026-01-17 08:00",
        status: "scheduled",
    },
    {
        id: "3",
        title: "年终总结：我的2025",
        platform: "B站",
        platformIcon: "📺",
        scheduledTime: "2026-01-18 20:00",
        status: "draft",
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
    },
    {
        id: "2",
        title: "5分钟早餐合集第8期",
        platform: "抖音",
        platformIcon: "🎵",
        publishedAt: "2026-01-13 08:00",
        views: 28000,
        likes: 2340,
    },
]

function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万"
    }
    return num.toLocaleString()
}

export default function PublishPage() {
    return (
        <DashboardLayout title="发布中心" breadcrumbs={[{ label: "发布中心" }]}>
            <div className="space-y-6">
                {/* 快速操作 */}
                <div className="flex gap-4">
                    <Button className="gap-2">
                        <Send className="size-4" />
                        立即发布
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <CalendarDays className="size-4" />
                        排期发布
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Clock className="size-4" />
                        批量排期
                    </Button>
                </div>

                {/* 待发布内容 */}
                <Card>
                    <CardHeader>
                        <CardTitle>待发布内容</CardTitle>
                        <CardDescription>已排期和待确认的内容</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {scheduledPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{post.platformIcon}</span>
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{post.platform}</span>
                                                <span>•</span>
                                                <Clock className="size-3" />
                                                <span>{post.scheduledTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                                            {post.status === "scheduled" ? "已排期" : "待确认"}
                                        </Badge>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 最近发布 */}
                <Card>
                    <CardHeader>
                        <CardTitle>最近发布</CardTitle>
                        <CardDescription>过去7天发布的内容</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentPublished.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
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
                                    <div className="text-right">
                                        <p className="font-medium">{formatNumber(post.views)} 播放</p>
                                        <p className="text-sm text-muted-foreground">{formatNumber(post.likes)} 点赞</p>
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
