"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Copy, RefreshCw, Lightbulb, FileText, MessageSquare, Target, Fingerprint, ArrowLeft } from "lucide-react"
import { NicheRadar } from "./components/niche-radar"
import { ContentDNA } from "./components/content-dna"

const aiCapabilities = [
    {
        icon: Lightbulb,
        title: "选题推荐",
        description: "基于热点趋势和你的账号定位，智能推荐选题",
        color: "from-amber-500 to-orange-500",
    },
    {
        icon: FileText,
        title: "脚本生成",
        description: "根据选题自动生成视频脚本和文案大纲",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: MessageSquare,
        title: "标题优化",
        description: "AI分析并优化你的标题，提升点击率",
        color: "from-violet-500 to-purple-500",
    },
]

const tools = [
    {
        id: "niche-radar",
        icon: Target,
        title: "AI 赛道雷达 (新手必看)",
        description: "迷茫不知道做什么？AI帮你分析蓝海赛道",
        color: "from-amber-500 to-orange-500",
    },
    {
        id: "content-dna",
        icon: Fingerprint,
        title: "AI 账号定位器",
        description: "一键生成人设、风格、简介，告别同质化",
        color: "from-indigo-500 to-purple-500",
    },
]

const samplePrompts = [
    "给我推荐3个适合小红书的护肤类选题",
    "帮我写一个关于早餐的短视频脚本",
    "优化这个标题：冬天护肤必看",
    "分析一下最近的美妆热点趋势",
]

export default function AIAssistantPage() {
    const [input, setInput] = useState("")
    const [activeTool, setActiveTool] = useState<string | null>(null)

    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        {
            role: "assistant",
            content: "👋 你好！我是你的AI创作助手。我可以帮你：\n\n• 推荐热门选题\n• 生成视频脚本和文案\n• 优化标题提升点击率\n• 分析平台热点趋势\n\n有什么我可以帮你的吗？",
        },
    ])

    const handleSend = () => {
        if (!input.trim()) return

        setMessages([
            ...messages,
            { role: "user", content: input },
            { role: "assistant", content: "正在思考中... 这是一个演示版本，完整功能将在后续版本中上线。🚀" },
        ])
        setInput("")
    }

    return (
        <DashboardLayout title="AI助手" breadcrumbs={[{ label: "AI助手" }]}>
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 聊天区域 */}
                <div className="lg:col-span-2">
                    {activeTool ? (
                        <div className="h-full flex flex-col">
                            <Button
                                variant="ghost"
                                className="self-start mb-4 gap-2 text-muted-foreground"
                                onClick={() => setActiveTool(null)}
                            >
                                <ArrowLeft className="size-4" /> 返回对话
                            </Button>
                            <div className="flex-1">
                                {activeTool === "niche-radar" && <NicheRadar />}
                                {activeTool === "content-dna" && <ContentDNA />}
                            </div>
                        </div>
                    ) : (
                        <Card className="h-[600px] flex flex-col border-0 shadow-sm ring-1 ring-border/50">
                            <CardHeader className="border-b bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                        <Sparkles className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">AI创作助手</CardTitle>
                                        <CardDescription>基于大语言模型的智能创作帮手</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-background border"
                                                }`}
                                        >
                                            <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                                            {message.role === "assistant" && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                                                        <Copy className="size-3 mr-1" />
                                                        复制
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                                                        <RefreshCw className="size-3 mr-1" />
                                                        重新生成
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <div className="p-4 border-t bg-muted/20">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="输入你的问题，或点击下方示例..."
                                        className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                    />
                                    <Button onClick={handleSend} className="gap-2 shadow-sm">
                                        <Send className="size-4" />
                                        发送
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 overflow-hidden h-6">
                                    {samplePrompts.map((prompt, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                            onClick={() => setInput(prompt)}
                                        >
                                            {prompt}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* 能力介绍 */}
                <div className="space-y-4">
                    <h3 className="font-semibold">新手启动 (New features)</h3>
                    {tools.map((tool) => (
                        <Card
                            key={tool.title}
                            className={`cursor-pointer transition-all hover:scale-105 border-primary/20 bg-gradient-to-br from-background to-muted/50 ${activeTool === tool.id ? 'ring-2 ring-primary border-primary' : ''}`}
                            onClick={() => setActiveTool(tool.id)}
                        >
                            <CardContent className="pt-6 relative overflow-hidden">
                                {activeTool === tool.id && <div className="absolute top-0 right-0 p-2"><Badge>运行中</Badge></div>}
                                <div className="flex items-start gap-4">
                                    <div className={`size-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 shadow-lg text-white`}>
                                        <tool.icon className="size-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{tool.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <h3 className="font-semibold pt-4 border-t">常用能力</h3>
                    {aiCapabilities.map((capability) => (
                        <Card key={capability.title} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`size-12 rounded-xl bg-gradient-to-br ${capability.color} flex items-center justify-center shrink-0`}>
                                        <capability.icon className="size-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{capability.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {capability.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-800">
                        <CardContent className="pt-6 text-center">
                            <Badge className="mb-3">即将上线</Badge>
                            <h4 className="font-semibold">更多AI能力</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                封面生成、视频剪辑建议、数据洞察分析...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
