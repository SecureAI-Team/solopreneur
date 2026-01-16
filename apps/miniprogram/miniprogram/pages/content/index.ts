import { api } from '../../utils/api';

Page({
    data: {
        tabs: ['全部', '图片', '视频', '音频'],
        activeTab: 0,
        searchQuery: '',
        viewMode: 'grid', // 'grid' | 'list'
        items: [] as any[],
        loading: false,
        hasMore: true,
    },

    onLoad() {
        this.fetchContent();
    },

    onPullDownRefresh() {
        this.fetchContent(true);
    },

    async fetchContent(refresh = false) {
        if (this.data.loading) return;

        this.setData({ loading: true });

        try {
            // Mapping tabs to API types: 'all' | 'image' | 'video' | 'audio'
            const typeMap = ['all', 'image', 'video', 'audio'];
            const type = typeMap[this.data.activeTab] === 'all' ? undefined : typeMap[this.data.activeTab];

            // Using /api/upload list endpoint for now as it lists raw files, 
            // or /api/content if we want the managed content.
            // The requirement "Content Page" usually refers to managed content (title, body, etc).
            // However, Media Page (Web) used /api/upload. 
            // Let's use /api/content which is the CMS content, OR /api/upload which is media library.
            // The miniprogram "Content" tab icon suggests "Document", so likely CMS Content.
            // But the web "Media" page was the focus earlier. 
            // Let's assume this page shows *Published Content* via /api/content first.

            const res = await api.content.list(undefined, type);

            if (res.success) {
                this.setData({
                    items: refresh ? res.data : [...this.data.items, ...res.data],
                    loading: false
                });
            }
        } catch (err) {
            console.error(err);
            this.setData({ loading: false });
        } finally {
            if (refresh) wx.stopPullDownRefresh();
        }
    },

    onTabChange(e: any) {
        const index = e.currentTarget.dataset.index;
        this.setData({ activeTab: index, items: [] }, () => {
            this.fetchContent(true);
        });
    },

    onSearch(e: any) {
        this.setData({ searchQuery: e.detail.value });
        // TODO: Client side filter or API search
    },

    toggleViewMode() {
        this.setData({
            viewMode: this.data.viewMode === 'grid' ? 'list' : 'grid'
        });
    },

    goToDetail(e: any) {
        const id = e.currentTarget.dataset.id;
        // wx.navigateTo({ url: `/pages/content/detail?id=${id}` });
        wx.showToast({ title: '详情页开发中', icon: 'none' });
    }
});
