
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
        updateProfile: (profile: {
            niche?: string;
            interests?: string[];
            skills?: string[];
            audience?: string;
            style?: string;
            contentDNA?: {
                persona?: string;
                visualStyle?: string;
                voice?: string;
                bio?: string;
            };
        }) => fetcher<any>('/auth/profile', {
            method: 'POST',
            body: JSON.stringify(profile),
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
        publish: (id: string, platforms: string[], scheduledAt?: string) => fetcher<any>(`/content/${id}/publish`, {
            method: 'POST',
            body: JSON.stringify({ platforms, scheduledAt }),
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
        generateNicheAnalysis: (data: { interests: string[]; skills: string[]; timeAvailable?: string }) => fetcher<any>('/ai/niche-analysis', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        generateContentDNA: (data: { niche: string }) => fetcher<any>('/ai/content-dna', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        generateImage: (prompt: string, style?: string) => fetcher<{ data: { url: string } }>('/ai/image/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, style }),
        }),
        polishText: (content: string, platform: string, instruction?: string) => fetcher<{ data: { content: string; changes: string[]; quality: number; agent: string } }>('/ai/text/polish', {
            method: 'POST',
            body: JSON.stringify({ content, platform, instruction }),
        }),
        generateLayout: (content: string, platform: string) => fetcher<{ data: { content: string; previewHtml?: string } }>('/ai/layout', {
            method: 'POST',
            body: JSON.stringify({ content, platform }),
        }),
        learnPatterns: (contents: Array<{
            id: string;
            title: string;
            body: string;
            platform?: string;
            views?: number;
            likes?: number;
            comments?: number;
        }>) => fetcher<{ data: { learnedPatterns: any; contentCount: number; totalEngagement: number } }>('/ai/learn', {
            method: 'POST',
            body: JSON.stringify({ contents }),
        }),
    },
    analytics: {
        getOverview: () => fetcher<any>('/analytics/dashboard'),
        getTrend: (days?: number) => fetcher<any>(`/analytics/trend?days=${days || 7}`),
        getTopContent: (limit?: number) => fetcher<any>(`/analytics/top-content?limit=${limit || 5}`),
        getAudience: () => fetcher<any>('/analytics/audience'),
    },
    comments: {
        list: () => fetcher<any>('/comments'),
        reply: (id: string, content: string) => fetcher<any>(`/comments/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),
    },
    platforms: {
        // Platform OAuth methods removed in Pure Tool Mode
        getCredentials: () => fetcher<Array<{
            platform: string;
            appId: string;
            appSecret: string | null;
            isConfigured: boolean;
        }>>('/platforms/credentials'),
    },
    automation: {
        list: () => fetcher<any>('/automation'),
        toggle: (type: string, isEnabled: boolean) => fetcher<any>('/automation/toggle', {
            method: 'POST',
            body: JSON.stringify({ type, isEnabled }),
        }),
        create: (data: { title: string; type: string; description: string }) => fetcher<any>('/automation', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    // Admin API
    admin: {
        dashboard: () => fetcher<any>('/admin/dashboard'),
        users: (params?: { page?: number; limit?: number; search?: string }) =>
            fetcher<any>(`/admin/users?page=${params?.page || 1}&limit=${params?.limit || 20}`),
        updateUser: (userId: string, updates: any) => fetcher<any>(`/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),
        getConfig: () => fetcher<any>('/admin/config'),
        saveConfig: (config: { key: string; value: string; isSecret?: boolean; category?: string; description?: string }) =>
            fetcher<any>('/admin/config', {
                method: 'POST',
                body: JSON.stringify(config),
            }),
        saveConfigBatch: (configs: Array<{ key: string; value: string; isSecret?: boolean; category?: string; description?: string }>) =>
            fetcher<any>('/admin/config/batch', {
                method: 'POST',
                body: JSON.stringify({ configs }),
            }),
        getPlans: () => fetcher<any>('/admin/plans'),
        savePlan: (plan: any) => fetcher<any>('/admin/plans', {
            method: 'POST',
            body: JSON.stringify(plan),
        }),
        getLogs: (params?: { page?: number; limit?: number }) =>
            fetcher<any>(`/admin/logs?page=${params?.page || 1}&limit=${params?.limit || 50}`),
    },
    research: {
        sync: (data: { keyword: string; platform: string; rawData: any[] }) => fetcher<any>('/research/sync', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        getHistory: () => fetcher<any>('/research/history'),
    },
};
