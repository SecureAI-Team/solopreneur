import { api } from '../../utils/api';

Page({
    data: {
        userInfo: null as any,
        overview: {
            totalViews: 0,
            viewsChange: 0,
            totalFollowers: 0,
            followersChange: 0
        },
        topContent: [] as any[],
        loading: true
    },

    onLoad() {
        this.initData();
    },

    onShow() {
        // Refresh user info if login status changed
        const token = wx.getStorageSync('token');
        if (token && !this.data.userInfo) {
            this.fetchUserInfo();
        } else if (!token && this.data.userInfo) {
            this.setData({ userInfo: null });
        }
    },

    onPullDownRefresh() {
        this.initData().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async initData() {
        this.setData({ loading: true });

        const token = wx.getStorageSync('token');
        if (token) {
            await this.fetchUserInfo();
        }

        try {
            const res = await api.analytics.getOverview();
            if (res.success && res.data) {
                this.setData({
                    overview: res.data.overview,
                    topContent: res.data.topContent || [],
                    loading: false
                });
            }
        } catch (err) {
            console.error('Fetch home data failed', err);
            this.setData({ loading: false });
        }
    },

    async fetchUserInfo() {
        try {
            const res = await api.auth.me();
            if (res.success) {
                this.setData({ userInfo: res.data });
            }
        } catch (e) {
            // Ignore, maybe token expired
        }
    },

    goToCreate() {
        wx.switchTab({ url: '/pages/publish/index' });
    },

    goToAI() {
        wx.showActionSheet({
            itemList: ['AI 赛道雷达', 'AI 内容 DNA'],
            success(res) {
                if (res.tapIndex === 0) {
                    wx.navigateTo({ url: '/pages/ai/niche/niche' });
                } else if (res.tapIndex === 1) {
                    wx.navigateTo({ url: '/pages/ai/dna/dna' });
                }
            },
            fail(res) {
                console.log(res.errMsg);
            }
        })
    },

    goToDetail(e: any) {
        // const id = e.currentTarget.dataset.id;
        wx.showToast({ title: '详情页开发中', icon: 'none' });
    }
});
