'use client';

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Share2, Calendar, Download } from "lucide-react"
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const overviewStats = [
    { label: "总播放量", value: "125.8K", change: 15.2, icon: Eye },
    { label: "总点赞数", value: "8.6K", change: 23.1, icon: Heart },
    { label: "总评论数", value: "1.2K", change: 8.5, icon: MessageSquare },
    { label: "总分享数", value: "856", change: -2.3, icon: Share2 },
]

const trendData = [
    { date: '01/09', views: 15600, likes: 1200, comments: 180 },
    { date: '01/10', views: 18200, likes: 1450, comments: 220 },
    { date: '01/11', views: 16800, likes: 1320, comments: 195 },
    { date: '01/12', views: 21000, likes: 1680, comments: 280 },
    { date: '01/13', views: 24500, likes: 1950, comments: 320 },
    { date: '01/14', views: 19800, likes: 1560, comments: 245 },
    { date: '01/15', views: 9900, likes: 790, comments: 125 },
];

const platformData = [
    { name: '抖音', value: 65000, color: '#1a1a1a' },
    { name: '小红书', value: 32000, color: '#ff2442' },
    { name: 'B站', value: 18000, color: '#00a1d6' },
    { name: 'YouTube', value: 10000, color: '#ff0000' },
];

const hourlyData = [
    { hour: '6点', engagement: 12 },
    { hour: '8点', engagement: 35 },
    { hour: '10点', engagement: 28 },
    { hour: '12点', engagement: 45 },
    { hour: '14点', engagement: 32 },
    { hour: '16点', engagement: 38 },
    { hour: '18点', engagement: 58 },
    { hour: '20点', engagement: 85 },
    { hour: '22点', engagement: 72 },
    { hour: '24点', engagement: 45 },
];

const topContent = [
    { rank: 1, title: "冬季护肤必备单品推荐", platform: "小红书", views: 45000, engagement: 12.5 },
    { rank: 2, title: "5分钟早餐合集第8期", platform: "抖音", views: 28000, engagement: 8.3 },
    { rank: 3, title: "年度好物盘点TOP10", platform: "B站", views: 22000, engagement: 6.8 },
    { rank: 4, title: "新手化妆教程", platform: "抖音", views: 18500, engagement: 5.2 },
    { rank: 5, title: "周末Vlog分享", platform: "B站", views: 12000, engagement: 4.1 },
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
                {/* 顶部操作栏 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">数据概览</h2>
                        <p className="text-muted-foreground">查看你的多平台运营数据</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            过去7天
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            导出报告
                        </Button>
                    </div>
                </div>

                {/* 数据概览卡片 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {overviewStats.map((stat) => (
                        <Card key={stat.label} className="overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900">
                                        <stat.icon className="size-5 text-violet-600 dark:text-violet-400" />
                                    </div>
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
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 趋势图表 */}
                <Card>
                    <CardHeader>
                        <CardTitle>数据趋势</CardTitle>
                        <CardDescription>过去7天的播放量、点赞数和评论数变化</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    name="播放量"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="likes"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorLikes)"
                                    name="点赞数"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 平台分布饼图 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>平台流量分布</CardTitle>
                            <CardDescription>过去30天各平台播放量占比</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={platformData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {platformData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [formatNumber(value), '播放量']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #eee',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {platformData.map((platform) => (
                                    <div key={platform.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: platform.color }}
                                        />
                                        <span className="text-sm">{platform.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatNumber(platform.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 最佳发布时段 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>最佳发布时段</CardTitle>
                            <CardDescription>各时段内容互动率对比</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                                    <YAxis stroke="#888" fontSize={12} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value}%`, '互动率']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #eee',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="engagement"
                                        fill="url(#barGradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950 rounded-lg">
                                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                    💡 AI建议：晚上8点-10点是您的黄金发布时段，互动率最高达85%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 热门内容排行 */}
                <Card>
                    <CardHeader>
                        <CardTitle>热门内容排行</CardTitle>
                        <CardDescription>本月表现最佳的内容</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topContent.map((content) => (
                                <div
                                    key={content.rank}
                                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                                >
                                    <div className={`size-10 rounded-full flex items-center justify-center font-bold ${content.rank === 1
                                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                                            : content.rank === 2
                                                ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white"
                                                : content.rank === 3
                                                    ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white"
                                                    : "bg-muted text-muted-foreground"
                                        }`}>
                                        {content.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{content.title}</p>
                                        <p className="text-sm text-muted-foreground">{content.platform}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{formatNumber(content.views)}</p>
                                        <p className="text-xs text-muted-foreground">互动率 {content.engagement}%</p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={content.rank <= 3 ? "bg-violet-100 text-violet-700" : ""}
                                    >
                                        {content.rank <= 3 ? "热门" : "普通"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
