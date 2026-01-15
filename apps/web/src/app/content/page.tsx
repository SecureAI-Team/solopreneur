import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PenLine, Image, Video, FileText, Plus, Sparkles } from "lucide-react"

const contentTypes = [
    {
        icon: Video,
        title: "短视频",
        description: "适合抖音、快手、视频号",
        color: "from-rose-500 to-pink-500",
    },
    {
        icon: Image,
        title: "图文笔记",
        description: "适合小红书、微博",
        color: "from-amber-500 to-orange-500",
    },
    {
        icon: FileText,
        title: "长文章",
        description: "适合公众号、B站专栏",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: PenLine,
        title: "自由创作",
        description: "空白画布自由发挥",
        color: "from-violet-500 to-purple-500",
    },
]

const drafts = [
    { id: "1", title: "春节回家好物推荐", type: "图文", updatedAt: "2分钟前" },
    { id: "2", title: "周末Vlog脚本", type: "视频", updatedAt: "1小时前" },
    { id: "3", title: "2026年度总结", type: "文章", updatedAt: "昨天" },
]

export default function ContentPage() {
    return (
        <DashboardLayout title="内容工作台" breadcrumbs={[{ label: "内容工作台" }]}>
            <div className="space-y-6">
                {/* 创建新内容 */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">创建新内容</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {contentTypes.map((type) => (
                            <Card
                                key={type.title}
                                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className={`size-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <type.icon className="size-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{type.title}</h3>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI快速创作 */}
                <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-800">
                    <CardContent className="flex items-center justify-between py-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="size-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">AI智能创作</h3>
                                <p className="text-sm text-muted-foreground">
                                    输入关键词，AI帮你生成完整内容框架
                                </p>
                            </div>
                        </div>
                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                            开始创作
                        </Button>
                    </CardContent>
                </Card>

                {/* 草稿箱 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>草稿箱</CardTitle>
                            <CardDescription>你有 {drafts.length} 个未完成的内容</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            查看全部
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                            <FileText className="size-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{draft.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">{draft.type}</Badge>
                                                <span>•</span>
                                                <span>{draft.updatedAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        继续编辑
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
