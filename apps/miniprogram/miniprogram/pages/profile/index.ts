import { api } from '../../utils/api';

Page({
    data: {
        userInfo: null as any
    },

    onShow() {
        this.checkLogin();
    },

    checkLogin() {
        const token = wx.getStorageSync('token');
        if (!token) {
            this.setData({ userInfo: null });
        } else {
            this.fetchUserInfo();
        }
    },

    async fetchUserInfo() {
        try {
            const res = await api.auth.me();
            if (res.success) {
                this.setData({ userInfo: res.data });
            }
        } catch (err) {
            console.error(err);
            // Token might be invalid
            wx.removeStorageSync('token');
            this.setData({ userInfo: null });
        }
    },

    handleLogin() {
        wx.login({
            success: async (res) => {
                if (res.code) {
                    try {
                        const loginRes = await api.auth.login(res.code);
                        if (loginRes.success) {
                            wx.setStorageSync('token', loginRes.data.token);
                            this.setData({ userInfo: loginRes.data.user });
                            wx.showToast({ title: '登录成功' });
                        }
                    } catch (e: any) {
                        wx.showToast({ title: '登录失败: ' + e.message, icon: 'none' });
                    }
                }
            }
        });
    },

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorageSync('token');
                    this.setData({ userInfo: null });
                    wx.showToast({ title: '已退出' });
                }
            }
        });
    }
});
