import { api } from '../../utils/api';

Page({
    data: {
        title: '',
        body: '',
        mediaType: 'image', // 'image' | 'video'
        mediaFiles: [] as any[], // Local file paths
        platforms: [
            { id: 'wechat', name: '微信公众号', checked: true },
            { id: 'xiaohongshu', name: '小红书', checked: false },
            { id: 'douyin', name: '抖音', checked: false },
            { id: 'bilibili', name: 'B站', checked: false }
        ],
        submitting: false,
        contentId: null as string | null
    },

    handleInput(e: any) {
        const field = e.currentTarget.dataset.field;
        this.setData({ [field]: e.detail.value });
    },

    handlePlatformChange(e: any) {
        const values = e.detail.value;
        const platforms = this.data.platforms.map(p => ({
            ...p,
            checked: values.includes(p.id)
        }));
        this.setData({ platforms });
    },

    async chooseMedia() {
        wx.chooseMedia({
            count: 9,
            mediaType: ['image', 'video'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                // Simple append for now
                this.setData({
                    mediaFiles: [...this.data.mediaFiles, ...res.tempFiles],
                    mediaType: res.type
                });
            }
        });
    },

    removeMedia(e: any) {
        const index = e.currentTarget.dataset.index;
        const mediaFiles = [...this.data.mediaFiles];
        mediaFiles.splice(index, 1);
        this.setData({ mediaFiles });
    },

    async submit() {
        if (!this.data.title) {
            wx.showToast({ title: '请输入标题', icon: 'none' });
            return;
        }

        if (this.data.mediaFiles.length === 0) {
            wx.showToast({ title: '请上传素材', icon: 'none' });
            return;
        }

        this.setData({ submitting: true });
        wx.showLoading({ title: '发布中...' });

        try {
            // 1. Upload Media
            const uploadPromises = this.data.mediaFiles.map(file =>
                api.upload.upload(file.tempFilePath)
            );
            const uploadedFiles = await Promise.all(uploadPromises);
            const mediaUrls = uploadedFiles.map(f => f.url);

            // 2. Create Content
            const selectedPlatforms = this.data.platforms.filter(p => p.checked).map(p => p.id);

            const contentRes = await api.content.create({
                title: this.data.title,
                body: this.data.body || this.data.title, // Use title as body if empty
                type: this.data.mediaType, // 'image' or 'video'
                mediaUrls,
                platforms: selectedPlatforms
            });

            if (contentRes.success) {
                const contentId = contentRes.data.id;

                // 3. Trigger Publish (Simulated async)
                if (selectedPlatforms.length > 0) {
                    await api.content.publish(contentId, selectedPlatforms);
                }

                wx.showToast({ title: '发布成功' });
                // Reset form
                this.setData({
                    title: '',
                    body: '',
                    mediaFiles: [],
                    submitting: false
                });

                // Navigate to content list
                setTimeout(() => {
                    wx.switchTab({ url: '/pages/content/index' });
                }, 1500);
            } else {
                throw new Error(contentRes.error);
            }

        } catch (err: any) {
            console.error(err);
            wx.showToast({ title: err.message || '发布失败', icon: 'none' });
            this.setData({ submitting: false });
        } finally {
            wx.hideLoading();
        }
    }
    async handleAITitle() {
        if (!this.data.title) return;
        
        wx.showLoading({ title: 'AI思考中...' });
        try {
            const res = await api.ai.optimizeTitle(this.data.title);
            if (res.success && res.data && res.data.length > 0) {
                // Show action sheet with options
                const titles = res.data;
                wx.showActionSheet({
                    itemList: titles,
                    success: (sheetRes) => {
                        this.setData({ title: titles[sheetRes.tapIndex] });
                    }
                });
            } else {
                wx.showToast({ title: '没有生成更好的标题', icon: 'none' });
            }
        } catch (e) {
             wx.showToast({ title: 'AI服务暂时不可用', icon: 'none' });
        } finally {
            wx.hideLoading();
        }
    }
});
