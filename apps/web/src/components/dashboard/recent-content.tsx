"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContentItem {
    id: string
    title: string
    platform: string
    status: "draft" | "scheduled" | "published"
    date: string
    views?: number
}

const recentContent: ContentItem[] = [
    {
        id: "1",
        title: "冬季护肤必备单品推荐",
        platform: "小红书",
        status: "published",
        date: "2026-01-14",
        views: 12500,
    },
    {
        id: "2",
        title: "5分钟早餐合集第8期",
        platform: "抖音",
        status: "published",
        date: "2026-01-13",
        views: 28000,
    },
    {
        id: "3",
        title: "2026年度计划制定指南",
        platform: "B站",
        status: "scheduled",
        date: "2026-01-16",
    },
    {
        id: "4",
        title: "AI工具效率指南",
        platform: "微信公众号",
        status: "draft",
        date: "2026-01-15",
    },
    {
        id: "5",
        title: "周末Vlog：咖啡店探店",
        platform: "抖音",
        status: "scheduled",
        date: "2026-01-17",
    },
]

const statusLabels: Record<ContentItem["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
    draft: { label: "草稿", variant: "outline" },
    scheduled: { label: "已排期", variant: "secondary" },
    published: { label: "已发布", variant: "default" },
}

const platformIcons: Record<string, string> = {
    "抖音": "🎵",
    "小红书": "📕",
    "B站": "📺",
    "微信公众号": "💬",
    "YouTube": "▶️",
}

function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万"
    }
    return num.toLocaleString()
}

export function RecentContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">近期内容</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="px-6 pb-6 space-y-3">
                        {recentContent.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xl">{platformIcons[item.platform] || "📄"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{item.platform}</span>
                                            <span>•</span>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {item.views && (
                                        <span className="text-sm text-muted-foreground">
                                            {formatNumber(item.views)} 播放
                                        </span>
                                    )}
                                    <Badge variant={statusLabels[item.status].variant}>
                                        {statusLabels[item.status].label}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
