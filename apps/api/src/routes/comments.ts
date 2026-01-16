import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db, comments } from '../db';
import { eq, desc, and } from 'drizzle-orm';

export const commentRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get unified inbox comments (with auto-seeding)
commentRoutes.get('/', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return c.json({ success: false, error: 'Authorization required' }, 401);
        }

        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        // 1. Check if user has any comments
        const existingCount = await db.query.comments.findFirst({
            where: eq(comments.userId, userId),
        });

        // 2. Auto-seed if empty (Migration from Mock -> Real DB)
        if (!existingCount) {
            console.log(`[Auto-Seed] Seeding comments for user ${userId}`);
            await db.insert(comments).values([
                {
                    userId,
                    platform: 'douyin',
                    content: '这个视频拍得太好了！求教程🔥',
                    authorName: '狂热粉丝',
                    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans1',
                    postTitle: '如何通过AI提高效率？',
                    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
                },
                {
                    userId,
                    platform: 'xiaohongshu',
                    content: '集美，这个封面是用什么做的呀？好精致！',
                    authorName: '也就是个路人',
                    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans2',
                    postTitle: '我的2025年度计划',
                    isReplied: true,
                    replyContent: '是用 Canvas 做哒！',
                    repliedAt: new Date(Date.now() - 1000 * 60 * 60),
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                },
                {
                    userId,
                    platform: 'bilibili',
                    content: '三连了，up主加油！',
                    authorName: '白嫖怪',
                    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans3',
                    postTitle: 'Docker 入门实战',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                }
            ]);
        }

        // 3. Query real data
        const result = await db.query.comments.findMany({
            where: eq(comments.userId, userId),
            orderBy: [desc(comments.createdAt)],
        });

        // Adapt to frontend interface if needed (Frontend expects 'author' object)
        const mapped = result.map(comm => ({
            id: comm.id,
            platform: comm.platform,
            content: comm.content,
            author: {
                name: comm.authorName,
                avatar: comm.authorAvatar
            },
            createdAt: comm.createdAt,
            isReplied: comm.isReplied,
            postTitle: comm.postTitle,
            replyContent: comm.replyContent
        }));

        return c.json({
            success: true,
            data: mapped
        });
    } catch (e: any) {
        console.error('Fetch comments error:', e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

// Reply to a comment
commentRoutes.post('/:id/reply', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return c.json({ success: false, error: 'Unauthorized' }, 401);
        }

        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        const commentId = c.req.param('id');
        const { content } = await c.req.json();

        if (!content || !content.trim()) {
            return c.json({ success: false, error: 'Content is required' }, 400);
        }

        // Update DB
        // Ensure comment belongs to user
        const result = await db.update(comments)
            .set({
                isReplied: true,
                replyContent: content,
                repliedAt: new Date()
            })
            .where(and(
                eq(comments.id, commentId),
                eq(comments.userId, userId)
            ))
            .returning();

        if (!result.length) {
            return c.json({ success: false, error: 'Comment not found or not owned by user' }, 404);
        }

        return c.json({
            success: true,
            message: '已回复',
            data: {
                commentId,
                content,
                repliedAt: result[0].repliedAt
            }
        });
    } catch (e: any) {
        console.error('Reply comment error:', e);
        return c.json({ success: false, error: e.message }, 500);
    }
});
