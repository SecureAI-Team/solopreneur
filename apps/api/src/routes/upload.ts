import { Hono } from 'hono';
import { uploadFile, uploadImage, uploadVideo } from '../services/oss';

export const uploadRoutes = new Hono();

// 上传文件
uploadRoutes.post('/', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ success: false, error: '请选择文件' }, 400);
        }

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        let result;
        const type = file.type;

        if (type.startsWith('image/')) {
            result = await uploadImage(fileBuffer, file.name);
        } else if (type.startsWith('video/')) {
            result = await uploadVideo(fileBuffer, file.name);
        } else {
            result = await uploadFile(fileBuffer, file.name);
        }

        return c.json({
            success: true,
            data: result,
            message: '上传成功',
        });
    } catch (error: any) {
        console.error('上传失败:', error);
        return c.json({
            success: false,
            error: error.message || '上传失败',
        }, 500);
    }
});
