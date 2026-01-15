"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    PenLine,
    CalendarPlus,
    TrendingUp,
    Upload,
    Sparkles,
    Link2
} from "lucide-react"

const quickActions = [
    {
        icon: PenLine,
        label: "创建内容",
        description: "开始新的创作",
        color: "from-violet-600 to-indigo-600",
        href: "/content/new",
    },
    {
        icon: Sparkles,
        label: "AI助手",
        description: "获取选题灵感",
        color: "from-amber-500 to-orange-500",
        href: "/ai-assistant",
    },
    {
        icon: CalendarPlus,
        label: "排期发布",
        description: "安排内容发布",
        color: "from-emerald-500 to-teal-500",
        href: "/publish",
    },
    {
        icon: TrendingUp,
        label: "查看数据",
        description: "分析运营效果",
        color: "from-blue-500 to-cyan-500",
        href: "/analytics",
    },
    {
        icon: Upload,
        label: "上传素材",
        description: "管理媒体库",
        color: "from-pink-500 to-rose-500",
        href: "/content/media",
    },
    {
        icon: Link2,
        label: "连接平台",
        description: "绑定新账号",
        color: "from-slate-500 to-zinc-600",
        href: "/settings/platforms",
    },
]

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">快速操作</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4 hover:border-primary/50 group relative overflow-hidden"
                        >
                            <div className={`size-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <action.icon className="size-5" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-sm">{action.label}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
