import { api } from '../../utils/api';

Page({
    data: {
        loading: true,
        overview: {
            totalViews: 0,
            viewsChange: 0,
            totalLikes: 0,
            likesChange: 0,
            totalComments: 0,
            commentsChange: 0
        },
        topContent: [] as any[]
    },

    onLoad() {
        this.fetchData();
    },

    onPullDownRefresh() {
        this.fetchData().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    async fetchData() {
        this.setData({ loading: true });
        try {
            const res = await api.analytics.getOverview();
            if (res.success && res.data) {
                this.setData({
                    overview: res.data.overview,
                    topContent: res.data.topContent || [], // Ensure array
                    loading: false
                });
            }
        } catch (err) {
            console.error(err);
            this.setData({ loading: false });
        }
    }
});
