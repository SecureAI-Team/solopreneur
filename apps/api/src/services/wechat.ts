
import { db } from '../db';
import { platformConnections, publishRecords, contents } from '@solomedia/database';
import { eq, and } from 'drizzle-orm';

const WX_APPID = process.env.WX_APPID || '';
/* 
 注意: 微信公众号发布接口需要 access_token。
 并且发布图文消息流程较为复杂:
 1. 上传图文消息内的图片获取URL (不占用素材库)
 2. 上传封面图片获取 media_id (占用素材库)
 3. 上传图文消息素材 (draft) 获取 media_id
 4. (可选) 群发接口 publish (正式发布)
 
 简化流程 (FreePublish / Draft):
 1. POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN
*/

export async function publishToWechat(userId: string, contentId: string, connectionId: string) {
    try {
        // 1. 获取连接信息 (Access Token)
        const connection = await db.query.platformConnections.findFirst({
            where: and(
                eq(platformConnections.id, connectionId),
                eq(platformConnections.userId, userId),
                eq(platformConnections.platform, 'wechat')
            )
        });

        if (!connection || !connection.accessToken) {
            throw new Error('未连接微信公众号或Token已过期');
        }

        // 2. 获取内容
        const content = await db.query.contents.findFirst({
            where: eq(contents.id, contentId)
        });

        if (!content) {
            throw new Error('内容不存在');
        }

        // 3. 构建微信图文消息结构
        // 模拟上传封面 (实际需要调用素材上传接口)
        const thumb_media_id = 'mock_thumb_media_id';

        const articles = [
            {
                title: content.title,
                author: connection.platformUsername || 'SoloMedia Creator',
                digest: content.body?.slice(0, 50) || '',
                content: content.body || '', // 注意: 微信内容需要HTML格式，且图片src必须是微信域名的
                content_source_url: 'https://solomedia.app',
                thumb_media_id: thumb_media_id,
                need_open_comment: 1, // 打开评论
                only_fans_can_comment: 0
            }
        ];

        // 4. 调用微信API (添加草稿)
        // const res = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${connection.accessToken}`, {
        //     method: 'POST',
        //     body: JSON.stringify({ articles })
        // });
        // const data = await res.json();

        // 模拟成功响应
        const data = {
            media_id: 'mock_draft_media_id_' + Date.now(),
            errcode: 0,
            errmsg: 'ok'
        };

        if (data.errcode !== 0) {
            throw new Error(`微信发布失败: ${data.errmsg}`);
        }

        // 5. 更新发布记录
        // 等待上层调用者创建 record，或者这里创建
        // 这里我们只负责执行发布逻辑，返回结果

        return {
            success: true,
            platformPostId: data.media_id,
            url: `https://mp.weixin.qq.com/s/${data.media_id}` // 模拟预览链接
        };

    } catch (error: any) {
        console.error('WeChat publish error:', error);
        throw error;
    }
}
