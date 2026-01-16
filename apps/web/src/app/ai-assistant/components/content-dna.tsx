"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Loader2, Fingerprint, Palette, Mic, User } from "lucide-react"

export function ContentDNA() {
    const [niche, setNiche] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleGenerate = async () => {
        if (!niche.trim()) return
        setLoading(true)
        try {
            const res = await api.ai.generateContentDNA({ niche })
            if (res.success) {
                setResult(res.data)
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
                    <Fingerprint className="size-5 text-indigo-500" />
                    AI 账号定位器 (Content DNA)
                </CardTitle>
                <CardDescription>
                    确立人设，统一风格，让粉丝一眼记住你。
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!result ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                placeholder="输入你的赛道（例如：省钱美食、职场英语）"
                                value={niche}
                                onChange={e => setNiche(e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <Button
                            className="w-full h-12"
                            onClick={handleGenerate}
                            disabled={loading || !niche.trim()}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "生成账号 DNA"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900">
                                <div className="flex items-center gap-2 text-violet-600 mb-2 font-semibold">
                                    <User className="size-4" /> 人设标签
                                </div>
                                <div className="text-lg">{result.persona}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                                <div className="flex items-center gap-2 text-blue-600 mb-2 font-semibold">
                                    <Palette className="size-4" /> 视觉风格
                                </div>
                                <div className="text-lg">{result.visualStyle}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900">
                                <div className="flex items-center gap-2 text-pink-600 mb-2 font-semibold">
                                    <Mic className="size-4" /> 语言风格
                                </div>
                                <div className="text-lg">{result.voice}</div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl">
                            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Bio / 简介</div>
                            <div className="text-xl font-medium leading-relaxed">
                                {result.bio}
                            </div>
                        </div>

                        <Button variant="outline" onClick={() => setResult(null)} className="w-full">
                            重新生成
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
