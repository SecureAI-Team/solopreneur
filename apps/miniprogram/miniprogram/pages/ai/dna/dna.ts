const request = (url: string, data: any) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `http://localhost:3002/api${url}`,
            method: 'POST',
            data,
            success: (res) => resolve(res.data),
            fail: reject
        })
    })
}

Page({
    data: {
        niche: '',
        loading: false,
        result: null as any
    },

    onLoad(options: any) {
        if (options.niche) {
            this.setData({ niche: decodeURIComponent(options.niche) })
        }
    },

    async generate() {
        if (!this.data.niche) return;

        this.setData({ loading: true });
        try {
            const res: any = await request('/ai/content-dna', {
                niche: this.data.niche
            });
            if (res.success) {
                this.setData({ result: res.data });
            }
        } catch (e) {
            console.error(e);
            wx.showToast({ title: '生成失败', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    },

    reset() {
        this.setData({ result: null });
    }
})
