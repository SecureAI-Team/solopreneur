// app.ts
App<IAppOption>({
    globalData: {
        userInfo: null,
        token: null,
        apiBaseUrl: 'https://your-domain.com/api', // 生产环境API地址
    },

    onLaunch() {
        // 检查登录状态
        const token = wx.getStorageSync('token');
        if (token) {
            this.globalData.token = token;
            this.getUserInfo();
        }
    },

    // 获取用户信息
    async getUserInfo() {
        try {
            const res = await this.request('/auth/me', 'GET');
            if (res.success) {
                this.globalData.userInfo = res.data;
            }
        } catch (e) {
            console.error('获取用户信息失败', e);
        }
    },

    // 微信登录
    async wxLogin(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            wx.login({
                success: async (loginRes) => {
                    if (loginRes.code) {
                        try {
                            const res = await this.request('/auth/wx-login', 'POST', {
                                code: loginRes.code,
                            });
                            if (res.success) {
                                this.globalData.token = res.data.token;
                                this.globalData.userInfo = res.data.user;
                                wx.setStorageSync('token', res.data.token);
                                resolve(true);
                            } else {
                                reject(new Error(res.error));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error('微信登录失败'));
                    }
                },
                fail: reject,
            });
        });
    },

    // 封装请求方法
    request(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.globalData.apiBaseUrl}${url}`,
                method,
                data,
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : '',
                },
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    } else if (res.statusCode === 401) {
                        // Token过期，重新登录
                        wx.removeStorageSync('token');
                        this.globalData.token = null;
                        wx.redirectTo({ url: '/pages/profile/index' });
                        reject(new Error('登录已过期'));
                    } else {
                        reject(new Error((res.data as any).error || '请求失败'));
                    }
                },
                fail: reject,
            });
        });
    },
});
