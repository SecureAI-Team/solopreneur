import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Share2 } from "lucide-react"

const overviewStats = [
    { label: "总播放量", value: "125.8K", change: 15.2, icon: Eye },
    { label: "总点赞数", value: "8.6K", change: 23.1, icon: Heart },
    { label: "总评论数", value: "1.2K", change: 8.5, icon: MessageSquare },
    { label: "总分享数", value: "856", change: -2.3, icon: Share2 },
]

const platformBreakdown = [
    { name: "抖音", icon: "🎵", views: 65000, percentage: 52 },
    { name: "小红书", icon: "📕", views: 32000, percentage: 25 },
    { name: "B站", icon: "📺", views: 18000, percentage: 14 },
    { name: "YouTube", icon: "▶️", views: 10000, percentage: 8 },
]

const topContent = [
    { rank: 1, title: "冬季护肤必备单品推荐", platform: "小红书", views: 45000, engagement: 12.5 },
    { rank: 2, title: "5分钟早餐合集第8期", platform: "抖音", views: 28000, engagement: 8.3 },
    { rank: 3, title: "年度好物盘点TOP10", platform: "B站", views: 22000, engagement: 6.8 },
]

function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万"
    }
    return num.toLocaleString()
}

export default function AnalyticsPage() {
    return (
        <DashboardLayout title="数据分析" breadcrumbs={[{ label: "数据分析" }]}>
            <div className="space-y-6">
                {/* 数据概览 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {overviewStats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <stat.icon className="size-5 text-muted-foreground" />
                                    <div className="flex items-center gap-1 text-sm">
                                        {stat.change > 0 ? (
                                            <>
                                                <TrendingUp className="size-4 text-emerald-500" />
                                                <span className="text-emerald-500">+{stat.change}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="size-4 text-rose-500" />
                                                <span className="text-rose-500">{stat.change}%</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 平台分布 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>平台流量分布</CardTitle>
                            <CardDescription>过去30天各平台播放量占比</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {platformBreakdown.map((platform) => (
                                <div key={platform.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span>{platform.icon}</span>
                                            <span className="font-medium">{platform.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {formatNumber(platform.views)}
                                            </span>
                                            <Badge variant="secondary">{platform.percentage}%</Badge>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all"
                                            style={{ width: `${platform.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* 热门内容 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>热门内容排行</CardTitle>
                            <CardDescription>本月表现最佳的内容</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topContent.map((content) => (
                                <div
                                    key={content.rank}
                                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${content.rank === 1
                                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                                            : content.rank === 2
                                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                                        }`}>
                                        {content.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{content.title}</p>
                                        <p className="text-sm text-muted-foreground">{content.platform}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatNumber(content.views)}</p>
                                        <p className="text-xs text-muted-foreground">互动率 {content.engagement}%</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
