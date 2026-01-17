'use client';

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, ThumbsUp, RefreshCw, Sparkles, Loader2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock Rules Data
const initialRules = [
    {
        id: 'auto-reply',
        title: '评论自动回复',
        description: '当收到包含特定关键词(如"求链接")的评论时，自动回复预设内容。',
        icon: MessageSquare,
        color: 'text-blue-500',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        enabled: true,
        stats: '今日已执行 45 次'
    },
    {
        id: 'auto-like',
        title: '智能点赞互动',
        description: '自动点赞评论区的高质量评论，提升粉丝互动率。',
        icon: ThumbsUp,
        color: 'text-pink-500',
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        enabled: false,
        stats: '今日已执行 0 次'
    },
    {
        id: 'content-sync',
        title: '多平台内容同步',
        description: '发布内容后，自动同步发布状态和数据表现。',
        icon: RefreshCw,
        color: 'text-emerald-500',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        enabled: true,
        stats: '监控中 3 个平台'
    },
    {
        id: 'ai-optimize',
        title: 'AI 标题优化',
        description: '发布前自动使用 AI 检查并优化标题吸引力。',
        icon: Sparkles,
        color: 'text-violet-500',
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        enabled: true,
        stats: '已优化 12 篇'
    }
];


export default function AutomationPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newRule, setNewRule] = useState({ title: "", type: "auto_reply", description: "" });

    useEffect(() => {
        api.automation.list().then(res => {
            if (res.success) {
                // Map API data to UI structure, assigning icons
                const uiRules = res.data.map((r: any) => {
                    let icon = Zap;
                    let color = 'text-gray-500';
                    let bg = 'bg-gray-100 dark:bg-gray-900/30';

                    if (r.type === 'auto_reply') { icon = MessageSquare; color = 'text-blue-500'; bg = 'bg-blue-100 dark:bg-blue-900/30'; }
                    if (r.type === 'auto_like') { icon = ThumbsUp; color = 'text-pink-500'; bg = 'bg-pink-100 dark:bg-pink-900/30'; }
                    if (r.type === 'cross_sync') { icon = RefreshCw; color = 'text-emerald-500'; bg = 'bg-emerald-100 dark:bg-emerald-900/30'; }
                    if (r.type === 'ai_optimize') { icon = Sparkles; color = 'text-violet-500'; bg = 'bg-violet-100 dark:bg-violet-900/30'; }

                    return {
                        id: r.type, // DB uses UUID but here we key by type or reuse DB Logic
                        ...r,
                        icon, color, bg,
                        title: r.label || r.title, // Backend sends label
                        description: r.desc || r.description, // Backend sends desc
                        stats: '运行正常'
                    }
                });
                setRules(uiRules);
            }
        });
    }, []);

    const handleToggle = async (type: string, currentStatus: boolean) => {
        setLoading(type);
        try {
            const res = await api.automation.toggle(type, !currentStatus);
            if (res.success) {
                setRules(prev => prev.map(rule =>
                    rule.type === type ? { ...rule, enabled: !currentStatus } : rule
                ));
                toast.success(currentStatus ? '规则已暂停' : '规则已启用');
            } else {
                toast.error(res.error || '操作失败');
            }
        } catch (e) {
            toast.error('请求出错');
        } finally {
            setLoading(null);
        }
    };

    const handleCreateRule = async () => {
        if (!newRule.title) return toast.error("请输入规则名称");
        setIsCreating(true);
        try {
            // Mock API endpoint for creation if backend doesn't support it yet
            // For now assuming api.automation.create connects to a real or mock endpoint
            await new Promise(r => setTimeout(r, 1000)); // Simulate delay
            const res = await api.automation.create(newRule);

            // Optimistic update or refresh
            // Since backend might verify, we'll just mock add it to UI for demo

            const newUiRule = {
                id: newRule.type + Date.now(),
                icon: Zap,
                color: 'text-gray-500',
                bg: 'bg-gray-100 dark:bg-gray-900/30',
                title: newRule.title,
                description: newRule.description,
                enabled: true,
                stats: '新创建',
                type: newRule.type
            };

            if (newRule.type === 'auto_reply') { newUiRule.icon = MessageSquare; newUiRule.color = 'text-blue-500'; newUiRule.bg = 'bg-blue-100 dark:bg-blue-900/30'; }
            if (newRule.type === 'auto_like') { newUiRule.icon = ThumbsUp; newUiRule.color = 'text-pink-500'; newUiRule.bg = 'bg-pink-100 dark:bg-pink-900/30'; }

            setRules(prev => [...prev, newUiRule]);
            toast.success("规则创建成功");
            setIsCreateOpen(false);
            setNewRule({ title: "", type: "auto_reply", description: "" });

        } catch (e) {
            toast.error("创建失败");
        } finally {
            setIsCreating(false);
        }
    };



    return (
        <DashboardLayout title="自动化" breadcrumbs={[{ label: "自动化" }]}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">自动化工作流</h2>
                        <p className="text-muted-foreground">管理您的自动执行规则，提升运营效率</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0">
                                <Zap className="size-4" />
                                创建新规则
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>创建自动化规则</DialogTitle>
                                <DialogDescription>
                                    配置新的自动化工作流以提升效率。
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>规则名称</Label>
                                    <Input
                                        placeholder="例如：自动回复好评"
                                        value={newRule.title}
                                        onChange={e => setNewRule({ ...newRule, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>规则类型</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newRule.type}
                                        onChange={e => setNewRule({ ...newRule, type: e.target.value })}
                                    >
                                        <option value="auto_reply">评论自动回复</option>
                                        <option value="auto_like">智能点赞</option>
                                        <option value="cross_sync">多平台同步</option>
                                        <option value="ai_optimize">AI 内容优化</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>描述 (可选)</Label>
                                    <Input
                                        placeholder="描述该规则的作用..."
                                        value={newRule.description}
                                        onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
                                <Button onClick={handleCreateRule} disabled={isCreating}>
                                    {isCreating ? '创建中...' : '确认创建'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    {rules.map((rule) => (
                        <Card key={rule.id} className="transition-all hover:shadow-md">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${rule.bg}`}>
                                    <rule.icon className={`size-6 ${rule.color}`} />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{rule.title}</h3>
                                        {rule.enabled ? (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">运行中</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-muted-foreground">已暂停</Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {rule.description}
                                    </p>
                                    <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Play className="size-3" />
                                            {rule.stats}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {loading === rule.type && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                                    <Switch
                                        checked={rule.enabled}
                                        onCheckedChange={() => handleToggle(rule.type, rule.enabled)}
                                        disabled={loading === rule.type}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
