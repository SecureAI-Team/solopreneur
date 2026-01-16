// 模拟API调用
const request = (url: string, data: any) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `http://localhost:3002/api${url}`,
            method: 'POST',
            data,
            header: {
                // 'Authorization': `Bearer ${wx.getStorageSync('token')}` 
            },
            success: (res) => resolve(res.data),
            fail: reject
        })
    })
}

Page({
    data: {
        step: 1,
        loading: false,
        interestsList: ["美食", "旅行", "数码", "美妆", "健身", "理财", "职场", "情感", "宠物", "穿搭"],
        skillsList: ["写作", "摄影", "剪辑", "演讲", "表演", "绘画", "编程", "外语"],
        selectedInterests: [] as string[],
        selectedSkills: [] as string[],
        customInterest: '',
        results: [] as any[]
    },

    toggleInterest(e: any) {
        const item = e.currentTarget.dataset.item
        const list = this.data.selectedInterests
        if (list.indexOf(item) > -1) {
            this.setData({ selectedInterests: list.filter(i => i !== item) })
        } else {
            this.setData({ selectedInterests: [...list, item] })
        }
    },

    toggleSkill(e: any) {
        const item = e.currentTarget.dataset.item
        const list = this.data.selectedSkills
        if (list.indexOf(item) > -1) {
            this.setData({ selectedSkills: list.filter(i => i !== item) })
        } else {
            this.setData({ selectedSkills: [...list, item] })
        }
    },

    async analyze() {
        if (this.data.selectedInterests.length === 0 && !this.data.customInterest) return;

        this.setData({ loading: true });

        try {
            const interests = this.data.customInterest
                ? [...this.data.selectedInterests, this.data.customInterest]
                : this.data.selectedInterests;

            const res: any = await request('/ai/niche-analysis', {
                interests,
                skills: this.data.selectedSkills
            });

            if (res.success) {
                this.setData({
                    results: res.data,
                    step: 2
                });
            }
        } catch (e) {
            console.error(e);
            wx.showToast({ title: '分析失败，请重试', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    },

    reset() {
        this.setData({ step: 1, results: [] });
    },

    selectNiche(e: any) {
        const niche = e.currentTarget.dataset.niche;
        wx.navigateTo({
            url: `/pages/ai/dna/dna?niche=${encodeURIComponent(niche)}`
        });
    }
})
