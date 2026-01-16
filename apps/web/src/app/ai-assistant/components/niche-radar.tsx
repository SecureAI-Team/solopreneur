"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { Loader2, ArrowRight, Target, TrendingUp, DollarSign } from "lucide-react"

export function NicheRadar() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const [interests, setInterests] = useState<string[]>([])
    const [skills, setSkills] = useState<string[]>([])
    const [customInterest, setCustomInterest] = useState("")

    const popularInterests = ["美食", "旅行", "数码", "美妆", "健身", "理财", "职场", "情感", "宠物", "穿搭"]
    const popularSkills = ["写作", "摄影", "剪辑", "演讲", "表演", "绘画", "编程", "外语"]

    const toggleInterest = (item: string) => {
        setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
    }

    const toggleSkill = (item: string) => {
        setSkills(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
    }

    const handleAnalyze = async () => {
        if (interests.length === 0) return

        setLoading(true)
        try {
            const finalInterests = customInterest ? [...interests, customInterest] : interests
            const res = await api.ai.generateNicheAnalysis({
                interests: finalInterests,
                skills,
            })
            if (res.success) {
                setResults(res.data)
                setStep(3)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full border-0 shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    AI 赛道雷达
                </CardTitle>
                <CardDescription>
                    不知道做什么方向？告诉我你的兴趣，AI帮你分析蓝海赛道。
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>你对什么感兴趣？(多选)</Label>
                            <div className="flex flex-wrap gap-2">
                                {popularInterests.map(item => (
                                    <div
                                        key={item}
                                        onClick={() => toggleInterest(item)}
                                        className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all border ${interests.includes(item)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:bg-muted"
                                            }`}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center">
                                <Input
                                    placeholder="其他兴趣..."
                                    value={customInterest}
                                    onChange={e => setCustomInterest(e.target.value)}
                                    className="max-w-[200px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>你擅长什么？(AI会根据技能匹配内容形式)</Label>
                            <div className="flex flex-wrap gap-2">
                                {popularSkills.map(item => (
                                    <div
                                        key={item}
                                        onClick={() => toggleSkill(item)}
                                        className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all border ${skills.includes(item)
                                                ? "bg-secondary text-secondary-foreground border-secondary"
                                                : "bg-background hover:bg-muted"
                                            }`}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleAnalyze}
                            disabled={interests.length === 0 && !customInterest}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 分析中...</>
                            ) : (
                                <>开始分析 <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid gap-4">
                            {results.map((item, index) => (
                                <div key={index} className="group relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br from-background to-muted/50 hover:to-muted transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-primary">{item.niche}</h3>
                                        <div className="flex gap-2 text-xs">
                                            <span className="flex items-center text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                                                <Target className="w-3 h-3 mr-1" /> 难度: {item.difficulty}
                                            </span>
                                            <span className="flex items-center text-green-500 font-medium bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded">
                                                <TrendingUp className="w-3 h-3 mr-1" /> 潜力: {item.potential}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                        {item.reason}
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        选择此赛道
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" onClick={() => setStep(1)}>重新分析</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
