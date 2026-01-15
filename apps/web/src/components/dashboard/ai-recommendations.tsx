"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface ContentIdea {
    id: string
    title: string
    type: "trending" | "seasonal" | "evergreen"
    platform: string
    score: number
}

const contentIdeas: ContentIdea[] = [
    {
        id: "1",
        title: "2026春节回家必备好物清单",
        type: "seasonal",
        platform: "小红书",
        score: 95,
    },
    {
        id: "2",
        title: "3分钟学会XX技巧（系列第5期）",
        type: "evergreen",
        platform: "抖音",
        score: 88,
    },
    {
        id: "3",
        title: "AI工具实测：效率提升10倍",
        type: "trending",
        platform: "B站",
        score: 92,
    },
    {
        id: "4",
        title: "本周热议话题深度解读",
        type: "trending",
        platform: "微信公众号",
        score: 85,
    },
]

const typeLabels: Record<ContentIdea["type"], { label: string; variant: "default" | "secondary" | "outline" }> = {
    trending: { label: "🔥 热点", variant: "default" },
    seasonal: { label: "📅 节日", variant: "secondary" },
    evergreen: { label: "♻️ 常青", variant: "outline" },
}

export function AIRecommendations() {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/20 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="size-4 text-white" />
                    </div>
                    <CardTitle className="text-base">AI选题推荐</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                    刷新推荐
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {contentIdeas.map((idea, index) => (
                    <div
                        key={idea.id}
                        className="group flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all cursor-pointer hover:shadow-sm"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                    #{index + 1}
                                </span>
                                <Badge variant={typeLabels[idea.type].variant} className="text-xs">
                                    {typeLabels[idea.type].label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {idea.platform}
                                </Badge>
                            </div>
                            <p className="font-medium truncate">{idea.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 flex-1 max-w-20 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                                        style={{ width: `${idea.score}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    推荐指数 {idea.score}
                                </span>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                        >
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                ))}

                <Button variant="outline" className="w-full mt-2">
                    查看更多推荐
                </Button>
            </CardContent>
        </Card>
    )
}
