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
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
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
