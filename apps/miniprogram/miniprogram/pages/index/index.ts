// 首页
const app = getApp<IAppOption>();

Page({
    data: {
        userInfo: null,
        overview: {
            totalViews: 0,
            totalFollowers: 0,
            totalInteractions: 0,
            estimatedRevenue: 0,
            viewsChange: 0,
            followersChange: 0,
        },
        topContent: [],
        loading: true,
    },

    onLoad() {
        this.loadData();
    },

    onShow() {
        this.setData({ userInfo: app.globalData.userInfo });
    },

    onPullDownRefresh() {
        this.loadData().finally(() => {
            wx.stopPullDownRefresh();
        });
    },

    async loadData() {
        try {
            this.setData({ loading: true });

            // 获取概览数据
            const overviewRes = await app.request('/analytics/overview');
            if (overviewRes.success) {
                this.setData({ overview: overviewRes.data });
            }

            // 获取热门内容
            const topContentRes = await app.request('/analytics/top-content?limit=3');
            if (topContentRes.success) {
                this.setData({ topContent: topContentRes.data });
            }
        } catch (e) {
            console.error('加载数据失败', e);
            wx.showToast({ title: '加载失败', icon: 'error' });
        } finally {
            this.setData({ loading: false });
        }
    },

    formatNumber(num: number): string {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    },

    // 跳转到内容创建
    goToCreate() {
        wx.navigateTo({ url: '/pages/content/create' });
    },

    // 跳转到AI助手
    goToAI() {
        wx.navigateTo({ url: '/pages/ai/index' });
    },
});
