import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Palette, Key, Link2, Shield } from "lucide-react"

const platforms = [
    { name: "抖音", icon: "🎵", connected: true, followers: "12.5K" },
    { name: "小红书", icon: "📕", connected: true, followers: "8.2K" },
    { name: "B站", icon: "📺", connected: true, followers: "5.6K" },
    { name: "微信公众号", icon: "💬", connected: false, followers: null },
    { name: "YouTube", icon: "▶️", connected: false, followers: null },
    { name: "快手", icon: "📹", connected: false, followers: null },
    { name: "X (Twitter)", icon: "𝕏", connected: false, followers: null },
]

const settingsSections = [
    { icon: Bell, title: "通知设置", description: "管理推送和提醒设置" },
    { icon: Palette, title: "外观设置", description: "主题和显示偏好" },
    { icon: Key, title: "API密钥", description: "管理AI服务密钥" },
    { icon: Shield, title: "隐私安全", description: "账户安全设置" },
]

export default function SettingsPage() {
    return (
        <DashboardLayout title="设置" breadcrumbs={[{ label: "设置" }]}>
            <div className="space-y-6">
                {/* 平台连接 */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Link2 className="size-5" />
                            <div>
                                <CardTitle>平台连接</CardTitle>
                                <CardDescription>管理你的社交媒体账号连接</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {platforms.map((platform) => (
                                <div
                                    key={platform.name}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{platform.icon}</span>
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
                                        <Badge variant="secondary">已连接</Badge>
                                    ) : (
                                        <Button size="sm" variant="outline">
                                            连接
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 其他设置 */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {settingsSections.map((section) => (
                        <Card key={section.title} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                                        <section.icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{section.title}</h3>
                                        <p className="text-sm text-muted-foreground">{section.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 关于 */}
                <Card>
                    <CardHeader>
                        <CardTitle>关于 SoloMedia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">版本</span>
                            <Badge variant="outline">v0.1.0 (MVP)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">订阅计划</span>
                            <Badge>免费版</Badge>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                SoloMedia 是一个面向个体创作者的AI驱动多平台自媒体运营中心。
                                帮助你以最小代价实现数据驱动的内容运营。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
