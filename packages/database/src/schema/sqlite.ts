import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Helper for boolean
const boolean = (name: string) => integer(name, { mode: 'boolean' });
// Helper for timestamp
const timestamp = (name: string) => integer(name, { mode: 'timestamp' });
// Helper for UUID primary key
const uuidPK = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());

// 用户表
export const users = sqliteTable('users', {
    id: uuidPK(),
    email: text('email').unique(),
    phone: text('phone'),
    password: text('password'),
    wxOpenId: text('wx_open_id'),
    wxUnionId: text('wx_union_id'),
    nickname: text('nickname'),
    avatar: text('avatar'),
    plan: text('plan').default('free'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 内容表
export const contents = sqliteTable('contents', {
    id: uuidPK(),
    userId: text('user_id').references(() => users.id).notNull(),
    title: text('title'),
    body: text('body'),
    type: text('type'), // video/image/article
    status: text('status').default('draft'), // draft/scheduled/published
    platforms: text('platforms', { mode: 'json' }).$type<string[]>(), // 目标平台列表
    mediaUrls: text('media_urls', { mode: 'json' }).$type<string[]>(), // 媒体文件URL
    scheduledAt: timestamp('scheduled_at'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 平台连接表
export const platformConnections = sqliteTable('platform_connections', {
    id: uuidPK(),
    userId: text('user_id').references(() => users.id).notNull(),
    platform: text('platform').notNull(), // douyin/xiaohongshu/bilibili/wechat/youtube
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    platformUserId: text('platform_user_id'),
    platformUsername: text('platform_username'),
    platformAvatar: text('platform_avatar'),
    followers: integer('followers').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 发布记录表
export const publishRecords = sqliteTable('publish_records', {
    id: uuidPK(),
    contentId: text('content_id').references(() => contents.id).notNull(),
    platformConnectionId: text('platform_connection_id').references(() => platformConnections.id).notNull(),
    platformPostId: text('platform_post_id'),
    status: text('status').default('pending'), // pending/publishing/published/failed
    errorMessage: text('error_message'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 数据统计表
export const analytics = sqliteTable('analytics', {
    id: uuidPK(),
    publishRecordId: text('publish_record_id').references(() => publishRecords.id).notNull(),
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    comments: integer('comments').default(0),
    shares: integer('shares').default(0),
    followers: integer('followers').default(0),
    recordedAt: timestamp('recorded_at').defaultNow(),
});

// AI对话历史表
export const aiConversations = sqliteTable('ai_conversations', {
    id: uuidPK(),
    userId: text('user_id').references(() => users.id).notNull(),
    messages: text('messages', { mode: 'json' }).$type<{ role: string; content: string }[]>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 自动化规则配置表
export const automationRules = sqliteTable('automation_rules', {
    id: uuidPK(),
    userId: text('user_id').references(() => users.id).notNull(),
    type: text('type').notNull(), // auto_reply, auto_like, cross_sync, ai_optimize
    isEnabled: boolean('is_enabled').default(false),
    config: text('config', { mode: 'json' }).$type<Record<string, any>>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// 评论表
export const comments = sqliteTable('comments', {
    id: uuidPK(),
    userId: text('user_id').references(() => users.id).notNull(),
    platform: text('platform').notNull(),
    content: text('content').notNull(),
    authorName: text('author_name'),
    authorAvatar: text('author_avatar'),
    postTitle: text('post_title'),
    isReplied: boolean('is_replied').default(false),
    replyContent: text('reply_content'),
    repliedAt: timestamp('replied_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ===============================
// Relations for db.query API
// ===============================
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
    contents: many(contents),
    platformConnections: many(platformConnections),
    aiConversations: many(aiConversations),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
    user: one(users, {
        fields: [contents.userId],
        references: [users.id],
    }),
    publishRecords: many(publishRecords),
}));

export const platformConnectionsRelations = relations(platformConnections, ({ one, many }) => ({
    user: one(users, {
        fields: [platformConnections.userId],
        references: [users.id],
    }),
    publishRecords: many(publishRecords),
}));

export const publishRecordsRelations = relations(publishRecords, ({ one, many }) => ({
    content: one(contents, {
        fields: [publishRecords.contentId],
        references: [contents.id],
    }),
    platformConnection: one(platformConnections, {
        fields: [publishRecords.platformConnectionId],
        references: [platformConnections.id],
    }),
    analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
    publishRecord: one(publishRecords, {
        fields: [analytics.publishRecordId],
        references: [publishRecords.id],
    }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
    user: one(users, {
        fields: [aiConversations.userId],
        references: [users.id],
    }),
}));
