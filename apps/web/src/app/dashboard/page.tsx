import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { AIRecommendations } from "@/components/dashboard/ai-recommendations"
import { RecentContent } from "@/components/dashboard/recent-content"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Eye, Users, Heart, Wallet } from "lucide-react"

export default function HomePage() {
  return (
    <DashboardLayout title="总览">
      <div className="space-y-6">
        {/* 欢迎语 */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            欢迎回来，创作者 👋
          </h1>
          <p className="text-muted-foreground">
            今天是 {new Date().toLocaleDateString("zh-CN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}，让我们开始创作吧！
          </p>
        </div>

        {/* 核心指标 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="总播放量"
            value="125.8K"
            change={15.2}
            icon={<Eye className="size-4" />}
          />
          <StatCard
            title="总粉丝数"
            value="43.4K"
            change={8.5}
            icon={<Users className="size-4" />}
          />
          <StatCard
            title="总互动数"
            value="12.6K"
            change={23.1}
            icon={<Heart className="size-4" />}
          />
          <StatCard
            title="预估收入"
            value="¥3,280"
            change={-2.3}
            changeLabel="较上周"
            icon={<Wallet className="size-4" />}
          />
        </div>

        {/* 主内容区域 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：AI推荐 + 快速操作 */}
          <div className="space-y-6 lg:col-span-2">
            <AIRecommendations />
            <QuickActions />
          </div>

          {/* 右侧：平台统计 */}
          <div className="space-y-6">
            <PlatformStats />
          </div>
        </div>

        {/* 近期内容 */}
        <RecentContent />
      </div>
    </DashboardLayout>
  )
}
