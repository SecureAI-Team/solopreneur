'use client';

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Bell, Palette, Key, Link2, Shield, User, Mail,
    Camera, Crown, ChevronRight, Moon, Sun, Check, Loader2
} from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

const platformsData = [
    { id: "douyin", name: "抖音", icon: "🎵", connected: true, followers: "12.5K", color: "bg-black" },
    { id: "xiaohongshu", name: "小红书", icon: "📕", connected: true, followers: "8.2K", color: "bg-red-500" },
    { id: "bilibili", name: "B站", icon: "📺", connected: true, followers: "5.6K", color: "bg-blue-400" },
    { id: "wechat", name: "微信公众号", icon: "💬", connected: false, followers: null, color: "bg-green-500" },
    { id: "youtube", name: "YouTube", icon: "▶️", connected: false, followers: null, color: "bg-red-600" },
    { id: "kuaishou", name: "快手", icon: "📹", connected: false, followers: null, color: "bg-orange-500" },
]

export default function SettingsPage() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

    const handleConnect = async (platformId: string) => {
        if (platformId !== 'wechat') {
            toast.info('该平台连接功能正在开发中');
            return;
        }

        setLoadingPlatform(platformId);
        try {
            const res = await api.platforms.getAuthUrl(platformId);
            if (res.success && res.data) {
                window.location.href = res.data.url;
            } else {
                toast.error(res.error || '获取授权链接失败');
            }
        } catch (error) {
            toast.error('连接出错，请稍后重试');
        } finally {
            setLoadingPlatform(null);
        }
    };

    return (
        <DashboardLayout title="设置" breadcrumbs={[{ label: "设置" }]}>
            <div className="space-y-6 max-w-4xl">
                {/* 个人资料 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="size-5" />
                            个人资料
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-6">
                            <div className="relative group">
                                <div className="size-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    创
                                </div>
                                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="size-6 text-white" />
                                </button>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">用户名</label>
                                        <Input defaultValue="创作者" className="bg-muted/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">邮箱</label>
                                        <Input defaultValue="creator@example.com" className="bg-muted/50" disabled />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">个人简介</label>
                                    <Input defaultValue="一个热爱分享生活的内容创作者 ✨" className="bg-muted/50" />
                                </div>
                                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">保存修改</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 订阅计划 */}
                <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                    <Crown className="size-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">免费版</h3>
                                        <Badge variant="secondary">当前计划</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">升级到专业版解锁更多功能</p>
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg">
                                升级专业版
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 平台连接 */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Link2 className="size-5" />
                                <div>
                                    <CardTitle>平台连接</CardTitle>
                                    <CardDescription>管理你的社交媒体账号</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline">已连接 3/6</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {platformsData.map((platform) => (
                                <div
                                    key={platform.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${platform.connected
                                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                                        : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-lg ${platform.color} flex items-center justify-center text-xl`}>
                                            {platform.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium">{platform.name}</p>
                                            {platform.connected && platform.followers && (
                                                <p className="text-sm text-muted-foreground">
                                                    {platform.followers} 粉丝
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {platform.connected ? (
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <Check className="size-4 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1"
                                            onClick={() => handleConnect(platform.id)}
                                            disabled={loadingPlatform === platform.id}
                                        >
                                            {loadingPlatform === platform.id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                '连接'
                                            )}
                                            {!loadingPlatform && <ChevronRight className="size-4" />}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 外观设置 */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="size-5" />
                            <CardTitle>外观设置</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">主题模式</p>
                                <p className="text-sm text-muted-foreground">选择你喜欢的界面主题</p>
                            </div>
                            <div className="flex rounded-lg bg-muted p-1">
                                {[
                                    { id: 'light', icon: Sun, label: '浅色' },
                                    { id: 'dark', icon: Moon, label: '深色' },
                                    { id: 'system', icon: Palette, label: '系统' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${theme === option.id
                                            ? 'bg-white dark:bg-slate-800 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        onClick={() => setTheme(option.id as any)}
                                    >
                                        <option.icon className="size-4" />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 其他设置 */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        { icon: Bell, title: "通知设置", description: "管理推送和提醒", color: "bg-blue-100 text-blue-600" },
                        { icon: Key, title: "API密钥", description: "管理AI服务密钥", color: "bg-amber-100 text-amber-600" },
                        { icon: Shield, title: "隐私安全", description: "账户安全设置", color: "bg-emerald-100 text-emerald-600" },
                        { icon: Mail, title: "邮件偏好", description: "订阅和通知邮件", color: "bg-violet-100 text-violet-600" },
                    ].map((section) => (
                        <Card key={section.title} className="cursor-pointer hover:shadow-lg transition-all group">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl ${section.color} flex items-center justify-center`}>
                                        <section.icon className="size-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold group-hover:text-violet-600 transition-colors">{section.title}</h3>
                                        <p className="text-sm text-muted-foreground">{section.description}</p>
                                    </div>
                                    <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 关于 */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">版本</span>
                            <Badge variant="outline">v0.1.0 MVP</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            SoloMedia - 面向个体创作者的AI驱动多平台自媒体运营中心 🚀
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
