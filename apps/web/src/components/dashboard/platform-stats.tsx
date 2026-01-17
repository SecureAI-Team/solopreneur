"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"




export interface PlatformData {
    name: string
    icon: string
    followers: number
    views: number
    engagement: number
    connected: boolean
}

interface PlatformStatsProps {
    data: PlatformData[];
}

function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万"
    }
    return num.toLocaleString()
}

export function PlatformStats({ data }: PlatformStatsProps) {
    const connectedPlatforms = data.filter(p => p.connected)
    const disconnectedPlatforms = data.filter(p => !p.connected)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">平台概览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {connectedPlatforms.map((platform) => (
                    <div
                        key={platform.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{platform.icon}</span>
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {platform.name}
                                    <Badge variant="secondary" className="text-xs">已连接</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatNumber(platform.followers)} 粉丝
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">{formatNumber(platform.views)}</div>
                            <div className="text-xs text-muted-foreground">
                                互动率 {platform.engagement}%
                            </div>
                        </div>
                    </div>
                ))}

                {disconnectedPlatforms.length > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">待连接平台</p>
                        <div className="flex flex-wrap gap-2">
                            {disconnectedPlatforms.map((platform) => (
                                <Badge
                                    key={platform.name}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    {platform.icon} {platform.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
