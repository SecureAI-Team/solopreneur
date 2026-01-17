
"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Search, Loader2, Sparkles, TrendingUp, BarChart2, Video, FileText } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ResearchRecord {
    id: string;
    keyword: string;
    platform: string;
    analysis: string;
    rawData: any[];
    createdAt: string;
}

export default function ResearchPage() {
    const [keyword, setKeyword] = useState("");
    const [platform, setPlatform] = useState("xiaohongshu");
    const [isSearching, setIsSearching] = useState(false);
    const [history, setHistory] = useState<ResearchRecord[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const res = await api.research.getHistory();
        if (res.success && res.data) {
            setHistory(res.data);
        }
    };

    const handleResearch = async () => {
        if (!keyword.trim()) return;

        setIsSearching(true);
        const toastId = toast.loading("🔍 正在唤起插件进行调研...");

        try {
            // 1. 发送指令给 Extension (通过 window.postMessage)
            // 插件会监听这个消息，执行爬虫，然后调用 /api/research/sync 回传数据
            window.postMessage({
                type: 'SOLOMEDIA_RESEARCH_START',
                payload: { keyword, platform }
            }, '*');

            // 监听插件完成消息
            const handleMessage = (event: MessageEvent) => {
                if (event.data.type === 'SOLOMEDIA_RESEARCH_COMPLETE') {
                    toast.dismiss(toastId);
                    toast.success("✅ 调研完成！AI 已生成分析报告");
                    setIsSearching(false);
                    loadHistory(); // 刷新列表
                    window.removeEventListener('message', handleMessage);
                } else if (event.data.type === 'SOLOMEDIA_RESEARCH_ERROR') {
                    toast.dismiss(toastId);
                    toast.error(event.data.payload?.error || "调研失败，请检查插件是否安装");
                    setIsSearching(false);
                    window.removeEventListener('message', handleMessage);
                }
            };
            window.addEventListener('message', handleMessage);

            // 超时保底 (1分钟)
            setTimeout(() => {
                if (isSearching) {
                    toast.dismiss(toastId);
                    // toast.error("连接超时，请确认浏览器插件已安装并启用");
                    // setIsSearching(false);
                }
            }, 60000);

            // Mock Extension Response for Demo (if extension not installed)
            setTimeout(() => {
                if (process.env.NODE_ENV === 'development') {
                    console.log("Mocking extension response...");
                    // Manually call sync API to simulate extension
                    api.research.sync({
                        keyword,
                        platform,
                        rawData: Array(10).fill(0).map((_, i) => ({ title: `Mock Result ${i} for ${keyword}` }))
                    }).then(() => {
                        window.postMessage({ type: 'SOLOMEDIA_RESEARCH_COMPLETE' }, '*');
                    });
                }
            }, 3000);

        } catch (error) {
            console.error(error);
            setIsSearching(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <DashboardLayout
            title="市场调研"
            breadcrumbs={[{ label: "创作中心" }, { label: "市场调研" }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">智能市场调研</h1>
                    <p className="text-muted-foreground">
                        输入关键词，让 AI 帮你全网搜索爆款，分析赛道趋势，生成新手起步指南。
                    </p>
                </div>

                {/* Search Box */}
                <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900">
                                    <SelectValue placeholder="选择平台" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="xiaohongshu">小红书 (Xiaohongshu)</SelectItem>
                                    <SelectItem value="douyin">抖音 (Douyin)</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex-1 flex gap-2">
                                <Input
                                    placeholder="输入关键词，例如：'数码测评'、'职场穿搭'..."
                                    className="bg-white dark:bg-zinc-900"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                                />
                                <Button
                                    onClick={handleResearch}
                                    disabled={isSearching || !keyword.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                                >
                                    {isSearching ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 调研中...</>
                                    ) : (
                                        <><Search className="mr-2 h-4 w-4" /> 开始调研</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Reports */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        最近调研报告
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {history.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>暂无调研记录，快去搜索一个关键词试试吧！</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <Card key={record.id} className="flex flex-col hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={record.platform === 'douyin' ? 'default' : 'secondary'} className="capitalize">
                                                {record.platform}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(record.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg line-clamp-1">{record.keyword}</CardTitle>
                                        <CardDescription>
                                            分析了 {record.rawData?.length || 0} 条爆款内容
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="text-sm text-muted-foreground line-clamp-4 markdown-preview">
                                            {record.analysis || "等待分析..."}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 border-t bg-muted/20">
                                        <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                            查看完整报告 <TrendingUp className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
