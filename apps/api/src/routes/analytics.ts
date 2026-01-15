import { Hono } from 'hono';

export const analyticsRoutes = new Hono();

// 模拟分析数据
const mockAnalytics = {
    overview: {
        totalViews: 125800,
        totalFollowers: 43400,
        totalInteractions: 12600,
        estimatedRevenue: 3280,
        viewsChange: 15.2,
        followersChange: 8.5,
        interactionsChange: 23.1,
        revenueChange: -2.3,
    },
    platformBreakdown: [
        { platform: 'douyin', name: '抖音', views: 65000, percentage: 52, followers: 12500 },
        { platform: 'xiaohongshu', name: '小红书', views: 32000, percentage: 25, followers: 8200 },
        { platform: 'bilibili', name: 'B站', views: 18000, percentage: 14, followers: 5600 },
        { platform: 'youtube', name: 'YouTube', views: 10000, percentage: 8, followers: 2100 },
    ],
    topContent: [
        { id: '1', title: '冬季护肤必备单品推荐', platform: 'xiaohongshu', views: 45000, engagement: 12.5 },
        { id: '2', title: '5分钟早餐合集第8期', platform: 'douyin', views: 28000, engagement: 8.3 },
        { id: '3', title: '年度好物盘点TOP10', platform: 'bilibili', views: 22000, engagement: 6.8 },
    ],
    recentTrend: [
        { date: '2026-01-09', views: 15600, interactions: 1200 },
        { date: '2026-01-10', views: 18200, interactions: 1450 },
        { date: '2026-01-11', views: 16800, interactions: 1320 },
        { date: '2026-01-12', views: 21000, interactions: 1680 },
        { date: '2026-01-13', views: 24500, interactions: 1950 },
        { date: '2026-01-14', views: 19800, interactions: 1560 },
        { date: '2026-01-15', views: 9900, interactions: 790 },
    ],
};

// 获取概览数据
analyticsRoutes.get('/overview', async (c) => {
    return c.json({
        success: true,
        data: mockAnalytics.overview,
    });
});

// 获取平台分布
analyticsRoutes.get('/platforms', async (c) => {
    return c.json({
        success: true,
        data: mockAnalytics.platformBreakdown,
    });
});

// 获取热门内容
analyticsRoutes.get('/top-content', async (c) => {
    const limit = Number(c.req.query('limit')) || 10;
    return c.json({
        success: true,
        data: mockAnalytics.topContent.slice(0, limit),
    });
});

// 获取趋势数据
analyticsRoutes.get('/trend', async (c) => {
    const days = Number(c.req.query('days')) || 7;
    return c.json({
        success: true,
        data: mockAnalytics.recentTrend.slice(-days),
    });
});

// 获取单个内容的分析
analyticsRoutes.get('/content/:id', async (c) => {
    const id = c.req.param('id');

    // 模拟内容分析数据
    return c.json({
        success: true,
        data: {
            contentId: id,
            totalViews: 45000,
            likes: 3200,
            comments: 456,
            shares: 128,
            saves: 890,
            avgWatchTime: 45, // 秒
            completionRate: 68.5, // 百分比
            audienceGender: { male: 35, female: 65 },
            audienceAge: { '18-24': 45, '25-34': 35, '35-44': 15, '45+': 5 },
        },
    });
});
