
import { db } from '../db';
import { platformConnections, contents } from '@solomedia/database';
import { eq, and } from 'drizzle-orm';

export async function publishToBilibili(userId: string, contentId: string, connectionId: string) {
    try {
        // 1. 获取连接
        const connection = await db.query.platformConnections.findFirst({
            where: and(
                eq(platformConnections.id, connectionId),
                eq(platformConnections.userId, userId),
                eq(platformConnections.platform, 'bilibili')
            )
        });

        if (!connection || !connection.accessToken) {
            throw new Error('未连接B站或授权已过期');
        }

        // 2. 获取内容
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, contentId)
        });

        if (!content) throw new Error('内容不存在');

        console.log(`[Bilibili Mock] Publishing video: ${content.title}`);

        // 3. 模拟B站投稿API
        // 步骤: access_token -> upload video -> archive/submit

        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockResponse = {
            bvid: 'BV1Mock' + Date.now().toString().slice(-6),
            aid: Date.now(),
            url: 'https://www.bilibili.com/video/BV1Mock' + Date.now().toString().slice(-6)
        };

        return {
            success: true,
            platformPostId: mockResponse.bvid,
            url: mockResponse.url
        };

    } catch (error: any) {
        console.error('Bilibili publish error:', error);
        throw error;
    }
}
