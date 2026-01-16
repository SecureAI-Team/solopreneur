// utils/api.ts
import { request, upload } from './request';

export const api = {
    auth: {
        login: (code: string) => request<any>({ url: '/auth/wx-login', method: 'POST', data: { code } }),
        register: (data: any) => request<any>({ url: '/auth/register', method: 'POST', data }),
        me: () => request<any>({ url: '/auth/me', method: 'GET' }),
    },
    content: {
        list: (status?: string, type?: string) => {
            let url = '/content';
            const params = [];
            if (status) params.push(`status=${status}`);
            if (type) params.push(`type=${type}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            return request<any>({ url, method: 'GET' });
        },
        create: (data: any) => request<any>({ url: '/content', method: 'POST', data }),
        publish: (id: string, platforms: string[]) => request<any>({ url: `/content/${id}/publish`, method: 'POST', data: { platforms } }),
        get: (id: string) => request<any>({ url: `/content/${id}`, method: 'GET' }),
    },
    upload: {
        upload: (filePath: string) => upload<any>(filePath),
        list: (prefix?: string) => request<any>({ url: `/upload?limit=100`, method: 'GET' })
    },
    analytics: {
        getOverview: () => request<any>({ url: '/analytics/dashboard', method: 'GET' })
    },
    ai: {
        optimizeTitle: (title: string, platform?: string) => request<any>({ url: '/ai/optimize-title', method: 'POST', data: { title, platform } }),
        generate: (topic: string, platform?: string) => request<any>({ url: '/ai/generate', method: 'POST', data: { topic, platform } })
    }
};
