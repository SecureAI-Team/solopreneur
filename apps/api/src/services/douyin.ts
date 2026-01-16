
import { db } from '../db';
import { platformConnections, contents } from '@solomedia/database';
import { eq, and } from 'drizzle-orm';

export async function publishToDouyin(userId: string, contentId: string, connectionId: string) {
    try {
        // 1. 获取连接信息
        const connection = await db.query.platformConnections.findFirst({
            where: and(
                eq(platformConnections.id, connectionId),
                eq(platformConnections.userId, userId),
                eq(platformConnections.platform, 'douyin')
            )
        });

        if (!connection || !connection.accessToken) {
            throw new Error('未连接抖音或授权已过期');
        }

        // 2. 获取内容
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, contentId)
        });

        if (!content) {
            throw new Error('内容不存在');
        }

        // 3. 验证内容类型 (抖音主要支持视频，但也支持图文)
        // 这里简单模拟
        console.log(`[Douyin Mock] Publishing content: ${content.title}`);

        // 4. 模拟调用抖音API
        // 实际流程: 
        // 1. upload/video -> video_id
        // 2. video/create -> item_id

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResponse = {
            data: {
                item_id: 'mock_douyin_item_' + Date.now(),
                share_url: 'https://www.douyin.com/video/' + Date.now()
            },
            extra: {
                now: Date.now(),
                logid: 'mock_log_id'
            }
        };

        return {
            success: true,
            platformPostId: mockResponse.data.item_id,
            url: mockResponse.data.share_url
        };

    } catch (error: any) {
        console.error('Douyin publish error:', error);
        throw error;
    }
}
