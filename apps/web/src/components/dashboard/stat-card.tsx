"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: React.ReactNode
    className?: string
}

export function StatCard({
    title,
    value,
    change,
    changeLabel = "较昨日",
    icon,
    className
}: StatCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0
    const isNeutral = change === 0

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                        {isPositive && (
                            <>
                                <TrendingUp className="size-3 text-emerald-500" />
                                <span className="text-emerald-500">+{change}%</span>
                            </>
                        )}
                        {isNegative && (
                            <>
                                <TrendingDown className="size-3 text-rose-500" />
                                <span className="text-rose-500">{change}%</span>
                            </>
                        )}
                        {isNeutral && (
                            <>
                                <Minus className="size-3 text-muted-foreground" />
                                <span className="text-muted-foreground">0%</span>
                            </>
                        )}
                        <span className="text-muted-foreground">{changeLabel}</span>
                    </div>
                )}
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        </Card>
    )
}
