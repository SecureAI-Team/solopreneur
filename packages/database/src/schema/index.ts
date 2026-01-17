import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

// 用户表
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 20 }),
    password: varchar('password', { length: 255 }),
    wxOpenId: varchar('wx_open_id', { length: 100 }),
    wxUnionId: varchar('wx_union_id', { length: 100 }),
    nickname: varchar('nickname', { length: 50 }),
    avatar: varchar('avatar', { length: 500 }),
    plan: varchar('plan', { length: 20 }).default('free'),
    // Admin fields
    isAdmin: boolean('is_admin').default(false),
    isDisabled: boolean('is_disabled').default(false),
    lastLoginAt: timestamp('last_login_at'),
    profile: jsonb('profile').$type<{
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
        onboardingCompleted?: boolean;
    }>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 内容学习表 - 用于AI从用户内容中学习风格
export const contentLearning = pgTable('content_learning', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    contentId: uuid('content_id').references(() => contents.id),
    learningType: varchar('learning_type', { length: 50 }), // style, tone, vocabulary, topic
    extractedFeatures: jsonb('extracted_features').$type<{
        keywords?: string[];
        sentiment?: string;
        tone?: string;
        emojiStyle?: string;
        hookPatterns?: string[];
        avgLength?: number;
    }>(),
    weight: integer('weight').default(1), // 权重，高互动内容权重更高
    createdAt: timestamp('created_at').defaultNow(),
});

// 内容表
export const contents = pgTable('contents', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 200 }),
    body: text('body'),
    type: varchar('type', { length: 20 }), // video/image/article
    status: varchar('status', { length: 20 }).default('draft'), // draft/scheduled/published
    platforms: jsonb('platforms').$type<string[]>(), // 目标平台列表
    mediaUrls: jsonb('media_urls').$type<string[]>(), // 媒体文件URL
    scheduledAt: timestamp('scheduled_at'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 平台连接表
export const platformConnections = pgTable('platform_connections', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    platform: varchar('platform', { length: 50 }).notNull(), // douyin/xiaohongshu/bilibili/wechat/youtube
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    platformUserId: varchar('platform_user_id', { length: 100 }),
    platformUsername: varchar('platform_username', { length: 100 }),
    platformAvatar: varchar('platform_avatar', { length: 500 }),
    followers: integer('followers').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 发布记录表
export const publishRecords = pgTable('publish_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    contentId: uuid('content_id').references(() => contents.id).notNull(),
    platformConnectionId: uuid('platform_connection_id').references(() => platformConnections.id).notNull(),
    platformPostId: varchar('platform_post_id', { length: 100 }),
    status: varchar('status', { length: 20 }).default('pending'), // pending/publishing/published/failed
    errorMessage: text('error_message'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 数据统计表
export const analytics = pgTable('analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    publishRecordId: uuid('publish_record_id').references(() => publishRecords.id).notNull(),
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    comments: integer('comments').default(0),
    shares: integer('shares').default(0),
    followers: integer('followers').default(0),
    recordedAt: timestamp('recorded_at').defaultNow(),
});

// AI对话历史表
export const aiConversations = pgTable('ai_conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    messages: jsonb('messages').$type<{ role: string; content: string }[]>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 自动化规则配置表
export const automationRules = pgTable('automation_rules', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // auto_reply, auto_like, cross_sync, ai_optimize
    isEnabled: boolean('is_enabled').default(false),
    config: jsonb('config').$type<Record<string, any>>(), // 额外配置，如回复模板
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 系统配置表 - 存储平台级别的配置（管理员管理）
export const systemConfig = pgTable('system_config', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).unique().notNull(),
    value: text('value'),
    isSecret: boolean('is_secret').default(false), // 是否为敏感值
    category: varchar('category', { length: 50 }), // platform, ai, storage, other
    description: varchar('description', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 套餐配置表 - 存储套餐功能限制
export const planConfig = pgTable('plan_config', {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: varchar('plan_id', { length: 20 }).unique().notNull(), // free, pro, enterprise
    name: varchar('name', { length: 50 }).notNull(),
    price: integer('price').default(0), // 月价格（分）
    maxPlatforms: integer('max_platforms').default(3),
    maxPostsPerMonth: integer('max_posts_per_month').default(10),
    features: jsonb('features').$type<{
        aiPolish?: boolean;
        aiImage?: boolean;
        analytics?: boolean;
        automation?: boolean;
        prioritySupport?: boolean;
    }>(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 管理员操作日志表
export const adminLogs = pgTable('admin_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').references(() => users.id).notNull(),
    action: varchar('action', { length: 50 }).notNull(), // user.disable, config.update, etc.
    targetType: varchar('target_type', { length: 50 }), // user, config, plan
    targetId: varchar('target_id', { length: 100 }),
    details: jsonb('details').$type<Record<string, any>>(),
    createdAt: timestamp('created_at').defaultNow(),
});

// 市场调研数据表 (New)
export const research = pgTable('research', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    keyword: varchar('keyword', { length: 100 }).notNull(),
    platform: varchar('platform', { length: 50 }).notNull(), // douyin/xiaohongshu
    rawData: jsonb('raw_data').$type<any[]>(), // 抓取的 Top 50 列表
    analysis: text('analysis'), // AI 生成的分析报告 (Markdown)
    createdAt: timestamp('created_at').defaultNow(),
});

// 插件同步数据表 (New)
export const syncedAnalytics = pgTable('synced_analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    platform: varchar('platform', { length: 50 }).notNull(),
    followers: integer('followers').default(0),
    likes: integer('likes').default(0),
    views: integer('views').default(0),
    rawData: jsonb('raw_data'), // 完整原始数据快照
    snapshotAt: timestamp('snapshot_at').defaultNow(), // 数据快照时间
});
