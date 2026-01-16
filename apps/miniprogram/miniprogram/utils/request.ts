// utils/request.ts

const BASE_URL = 'http://localhost:3001/api';

export const request = <T>(options: WechatMiniprogram.RequestOption): Promise<T> => {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token');

        // Merge headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.header
        };

        if (token) {
            // @ts-ignore
            headers['Authorization'] = `Bearer ${token}`;
        }

        wx.request({
            url: `${BASE_URL}${options.url}`,
            method: options.method || 'GET',
            data: options.data,
            header: headers,
            success: (res) => {
                // Handle standard HTTP errors
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data as T);
                } else if (res.statusCode === 401) {
                    // Token expired or invalid
                    wx.removeStorageSync('token');
                    // Optional: Redirect to login or silent refresh
                    wx.showToast({ title: '请重新登录', icon: 'none' });
                    reject(res);
                } else {
                    reject(res);
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
};

export const upload = <T>(filePath: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token');

        wx.uploadFile({
            url: `${BASE_URL}/upload`,
            filePath: filePath,
            name: 'file',
            header: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success(res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const data = JSON.parse(res.data);
                        resolve(data as T);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(res);
                }
            },
            fail(err) {
                reject(err);
            }
        })
    })
}
