import { z } from 'zod';

// API响应类型
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 用户相关类型
export interface User {
    id: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: Date;
}

// 内容类型
export type ContentType = 'video' | 'image' | 'article';
export type ContentStatus = 'draft' | 'scheduled' | 'published';
export type Platform = 'douyin' | 'xiaohongshu' | 'bilibili' | 'wechat' | 'youtube' | 'kuaishou' | 'weibo' | 'twitter';

export interface Content {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: ContentType;
    status: ContentStatus;
    platforms: Platform[];
    mediaUrls: string[];
    scheduledAt?: Date;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 平台连接类型
export interface PlatformConnection {
    id: string;
    userId: string;
    platform: Platform;
    platformUserId: string;
    platformUsername: string;
    platformAvatar?: string;
    followers: number;
    isActive: boolean;
    createdAt: Date;
}

// Zod验证Schema
export const loginSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(11).optional(),
    password: z.string().min(6),
}).refine(data => data.email || data.phone, {
    message: "邮箱或手机号必须提供其一"
});

export const registerSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(11).optional(),
    password: z.string().min(6),
    nickname: z.string().min(2).max(50).optional(),
}).refine(data => data.email || data.phone, {
    message: "邮箱或手机号必须提供其一"
});

export const createContentSchema = z.object({
    title: z.string().min(1).max(200),
    body: z.string().optional(),
    type: z.enum(['video', 'image', 'article']),
    platforms: z.array(z.enum(['douyin', 'xiaohongshu', 'bilibili', 'wechat', 'youtube', 'kuaishou', 'weibo', 'twitter'])),
    mediaUrls: z.array(z.string().url()).optional(),
    scheduledAt: z.string().datetime().optional(),
});

export const wxLoginSchema = z.object({
    code: z.string(), // 微信小程序登录code
});

// 常量
export const PLATFORMS = [
    { id: 'douyin', name: '抖音', icon: '🎵' },
    { id: 'xiaohongshu', name: '小红书', icon: '📕' },
    { id: 'bilibili', name: 'B站', icon: '📺' },
    { id: 'wechat', name: '微信公众号', icon: '💬' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'kuaishou', name: '快手', icon: '📹' },
    { id: 'weibo', name: '微博', icon: '🔴' },
    { id: 'twitter', name: 'X (Twitter)', icon: '𝕏' },
] as const;

export const CONTENT_TYPES = [
    { id: 'video', name: '短视频', icon: '🎬' },
    { id: 'image', name: '图文笔记', icon: '🖼️' },
    { id: 'article', name: '长文章', icon: '📝' },
] as const;
