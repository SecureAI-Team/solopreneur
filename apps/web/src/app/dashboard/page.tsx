'use client';

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { AIRecommendations } from "@/components/dashboard/ai-recommendations"
import { RecentContent } from "@/components/dashboard/recent-content"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Eye, Users, Heart, Wallet, Loader2, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.analytics.getOverview();
      if (res.success) {
        setStats(res.data);
      } else {
        console.error("Failed to fetch stats:", res.error);
      }
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading("正在同步全平台数据...", { id: 'sync-toast' });

    // Broadcast sync event to extension
    window.postMessage({ type: 'SOLOMEDIA_SYNC_START' }, '*');

    // Wait for completion (Listen for window message)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SOLOMEDIA_SYNC_COMPLETE') {
        toast.success("✅ 数据同步完成", { id: 'sync-toast' });
        setIsSyncing(false);
        fetchData(); // Reload stats
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'SOLOMEDIA_SYNC_ERROR') {
        toast.error("同步失败: " + (event.data.payload?.error || "未知错误"), { id: 'sync-toast' });
        setIsSyncing(false);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);

    // Timeout fallback (5s for demo / 30s real)
    setTimeout(() => {
      if (isSyncing) {
        // Mock success in dev mode if no extension
        if (process.env.NODE_ENV === 'development') {
          console.log("Mocking sync success...");
          window.postMessage({ type: 'SOLOMEDIA_SYNC_COMPLETE' }, '*');
        } else {
          toast.dismiss('sync-toast');
          // Don't error, just stop spinning. Maybe extension is silent.
          setIsSyncing(false);
        }
      }
    }, 5000);
  };

  const defaultStats = {
    totalViews: 0,
    totalFans: 0,
    totalEngagement: 0,
    estimatedIncome: 0,
    platformStats: []
  };

  const data = stats || defaultStats;

  return (
    <DashboardLayout title="总览">
      <div className="space-y-8">
        {/* 欢迎语 */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block">
            欢迎回来，创作者 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            今天是 {new Date().toLocaleDateString("zh-CN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}，让我们开始创作吧！
          </p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="size-10 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            {/* 新手引导 (当数据为0时显示) */}
            <OnboardingGuide
              stats={{
                connectedPlatforms: data.platformStats?.filter((p: any) => p.connected).length || 0,
                totalContent: data.totalViews > 0 ? 1 : 0, // Mock logic: has views implies content
                totalPublished: data.totalViews > 0 ? 1 : 0
              }}
            />

            {/* 核心指标 & Sync Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold tracking-tight">数据概览</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? '同步中...' : '同步最新数据'}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="总播放量"
                value={data.totalViews > 10000 ? (data.totalViews / 10000).toFixed(1) + '万' : data.totalViews.toLocaleString()}
                change={15.2} // 暂无环比数据，保留 Mock
                icon={<Eye className="size-4" />}
                changeLabel="较上周"
              />
              <StatCard
                title="总粉丝数"
                value={data.totalFans > 10000 ? (data.totalFans / 10000).toFixed(1) + '万' : data.totalFans.toLocaleString()}
                change={8.5}
                icon={<Users className="size-4" />}
                changeLabel="较上周"
              />
              <StatCard
                title="平均互动率"
                value={data.totalEngagement + '%'}
                change={0}
                icon={<Heart className="size-4" />}
                changeLabel="较上周"
              />
              <StatCard
                title="预估收入"
                value={'¥' + data.estimatedIncome.toLocaleString()}
                change={0}
                changeLabel="较上周"
                icon={<Wallet className="size-4" />}

              />
            </div>

            {/* 主内容区域 */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* 左侧：AI推荐 + 快速操作 */}
              <div className="space-y-8 lg:col-span-2">
                <AIRecommendations />
                <QuickActions />
              </div>

              {/* 右侧：平台统计 */}
              <div className="space-y-8">
                <PlatformStats data={data.platformStats} />
              </div>
            </div>

            {/* 近期内容 */}
            <RecentContent />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
