
import { LoginInput, RegisterInput, CreateContentInput, UpdateContentInput } from '@solomedia/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

const fetcher = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
        const headers = {
            ...getHeaders(),
            ...options.headers,
        };

        // 如果 body 是 FormData，删除 Content-Type header，让浏览器自动设置（包含 boundary）
        if (options.body instanceof FormData) {
            delete (headers as any)['Content-Type'];
        }

        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '请求失败');
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || '网络错误',
        };
    }
};

export const api = {
    auth: {
        login: (data: LoginInput) => fetcher<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        register: (data: RegisterInput) => fetcher<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        me: () => fetcher<any>('/auth/me'),
        wxLogin: (code: string) => fetcher<{ user: any; token: string }>('/auth/wx-login', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }),
    },
    content: {
        list: (params?: { status?: string; type?: string }) => {
            const qs = new URLSearchParams(params as any).toString();
            return fetcher<any[]>(`/content?${qs}`);
        },
        get: (id: string) => fetcher<any>(`/content/${id}`),
        create: (data: CreateContentInput) => fetcher<any>('/content', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<CreateContentInput>) => fetcher<any>(`/content/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetcher<void>(`/content/${id}`, {
            method: 'DELETE',
        }),
        publish: (id: string, platforms: string[]) => fetcher<any>(`/content/${id}/publish`, {
            method: 'POST',
            body: JSON.stringify({ platforms }),
        }),
    },
    upload: {
        upload: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return fetcher<{ url: string; name: string; size: number; type: string }>('/upload', {
                method: 'POST',
                body: formData,
            });
        },
        list: (limit: number = 100) => fetcher<any[]>(`/upload?limit=${limit}`),
        delete: (filename: string) => fetcher<void>('/upload', {
            method: 'DELETE',
            body: JSON.stringify({ filename }),
        }),
    },
    ai: {
        generateTopics: (data: any) => fetcher<any>('/ai/topics', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        generateContent: (data: any) => fetcher<any>('/ai/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    analytics: {
        getOverview: () => fetcher<any>('/analytics/dashboard'),
        getTrend: (days?: number) => fetcher<any>(`/analytics/trend?days=${days || 7}`),
        getTopContent: (limit?: number) => fetcher<any>(`/analytics/top-content?limit=${limit || 5}`),
    },
    comments: {
        list: () => fetcher<any>('/comments'),
        reply: (id: string, content: string) => fetcher<any>(`/comments/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),
    },
    platforms: {
        getAuthUrl: (platform: string) => fetcher<{ url: string }>(`/platforms/${platform}/auth-url`),
        connectWechat: (code: string) => fetcher<any>('/platforms/wechat/callback', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }),
        connectDouyin: (code: string) => fetcher<any>('/platforms/douyin/callback', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }),
        connectXiaohongshu: (code: string) => fetcher<any>('/platforms/xiaohongshu/callback', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }),
        connectBilibili: (code: string) => fetcher<any>('/platforms/bilibili/callback', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }),
    }
};
