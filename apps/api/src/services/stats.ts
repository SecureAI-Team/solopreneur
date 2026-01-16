
import { db } from '../db';
import { platformConnections } from '@solomedia/database';
import { eq } from 'drizzle-orm';

export interface PlatformStat {
    platform: string;
    name: string;
    icon: string;
    followers: number;
    views: number;
    engagement: number;
    connected: boolean;
}

export interface DashboardStats {
    totalViews: number;
    totalFans: number;
    totalEngagement: number;
    estimatedIncome: number;
    platformStats: PlatformStat[];
    recentGrowth: number[]; // 简单的趋势数据
}

// 模拟各平台的 Mock 数据生成器
const generateMockStats = (platform: string) => {
    // 基于平台产生一些随机但合理的数据
    const base = platform.length * 1000;
    return {
        followers: base + Math.floor(Math.random() * 5000),
        views: base * 10 + Math.floor(Math.random() * 20000),
        engagement: Number((Math.random() * 15).toFixed(1)),
        income: Math.floor(Math.random() * 1000)
    };
};

const PLATFORM_CONFIG: Record<string, { name: string, icon: string }> = {
    'douyin': { name: '抖音', icon: '🎵' },
    'xiaohongshu': { name: '小红书', icon: '📕' },
    'bilibili': { name: 'B站', icon: '📺' },
    'wechat': { name: '微信公众号', icon: '💬' },
    'youtube': { name: 'YouTube', icon: '▶️' },
    'kuaishou': { name: '快手', icon: '📹' }
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    // 1. 获取用户所有连接
    const connections = await db.query.platformConnections.findMany({
        where: eq(platformConnections.userId, userId)
    });

    const connectedMap = new Set(connections.map(c => c.platform));
    const platformsList = Object.keys(PLATFORM_CONFIG);

    let totalViews = 0;
    let totalFans = 0;
    let totalEngagement = 0; // 平均互动率
    let estimatedIncome = 0;
    let engagementCount = 0;

    const platformStats: PlatformStat[] = platformsList.map(platform => {
        const isConnected = connectedMap.has(platform);
        const config = PLATFORM_CONFIG[platform];

        let stats = { followers: 0, views: 0, engagement: 0, income: 0 };

        if (isConnected) {
            // 在 Beta 阶段，我们生成 Mock 数据
            // 在 RC 阶段，这里应该调用 getStatsFromPlatform(connection)
            stats = generateMockStats(platform);

            totalViews += stats.views;
            totalFans += stats.followers;
            totalEngagement += stats.engagement;
            estimatedIncome += stats.income;
            engagementCount++;
        }

        return {
            platform,
            name: config.name,
            icon: config.icon,
            followers: stats.followers,
            views: stats.views,
            engagement: stats.engagement,
            connected: isConnected
        };
    });

    // 排序：已连接的在前，然后按粉丝数排序
    platformStats.sort((a, b) => {
        if (a.connected === b.connected) return b.followers - a.followers;
        return a.connected ? -1 : 1;
    });

    return {
        totalViews,
        totalFans,
        totalEngagement: engagementCount > 0 ? Number((totalEngagement / engagementCount).toFixed(1)) : 0,
        estimatedIncome,
        platformStats,
        recentGrowth: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) // 模拟趋势
    };
}
