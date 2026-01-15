/**
 * 阿里云OSS文件上传服务
 */

import OSS from 'ali-oss';

// 创建OSS客户端
function createClient(): OSS {
    const region = process.env.ALIYUN_OSS_REGION;
    const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
    const bucket = process.env.ALIYUN_OSS_BUCKET;

    if (!region || !accessKeyId || !accessKeySecret || !bucket) {
        throw new Error('阿里云OSS配置不完整，请检查环境变量');
    }

    return new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
    });
}

export interface UploadResult {
    url: string;
    name: string;
    size: number;
    type: string;
}

/**
 * 上传文件到OSS
 */
export async function uploadFile(
    file: Buffer | Blob,
    filename: string,
    options?: {
        folder?: string;
        contentType?: string;
    }
): Promise<UploadResult> {
    const client = createClient();

    // 生成唯一文件名
    const timestamp = Date.now();
    const ext = filename.split('.').pop() || '';
    const folder = options?.folder || 'uploads';
    const objectName = `${folder}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // 转换Blob为Buffer
    let buffer: Buffer;
    if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } else {
        buffer = file;
    }

    // 上传文件
    const result = await client.put(objectName, buffer, {
        headers: {
            'Content-Type': options?.contentType || getMimeType(ext),
        },
    });

    return {
        url: result.url,
        name: objectName,
        size: buffer.length,
        type: options?.contentType || getMimeType(ext),
    };
}

/**
 * 上传图片（带压缩参数）
 */
export async function uploadImage(
    file: Buffer | Blob,
    filename: string,
    options?: {
        folder?: string;
        maxWidth?: number;
        quality?: number;
    }
): Promise<UploadResult> {
    const result = await uploadFile(file, filename, {
        folder: options?.folder || 'images',
        contentType: getMimeType(filename.split('.').pop() || 'jpg'),
    });

    // 添加OSS图片处理参数
    if (result.url) {
        const params: string[] = [];
        if (options?.maxWidth) {
            params.push(`image/resize,w_${options.maxWidth}`);
        }
        if (options?.quality) {
            params.push(`quality,q_${options.quality}`);
        }
        if (params.length > 0) {
            result.url = `${result.url}?x-oss-process=${params.join('/')}`;
        }
    }

    return result;
}

/**
 * 上传视频
 */
export async function uploadVideo(
    file: Buffer | Blob,
    filename: string,
    options?: {
        folder?: string;
    }
): Promise<UploadResult> {
    return uploadFile(file, filename, {
        folder: options?.folder || 'videos',
        contentType: getMimeType(filename.split('.').pop() || 'mp4'),
    });
}

/**
 * 生成签名URL（用于私有bucket）
 */
export async function getSignedUrl(
    objectName: string,
    expires: number = 3600
): Promise<string> {
    const client = createClient();
    return client.signatureUrl(objectName, { expires });
}

/**
 * 删除文件
 */
export async function deleteFile(objectName: string): Promise<void> {
    const client = createClient();
    await client.delete(objectName);
}

/**
 * 列出文件
 */
export async function listFiles(prefix: string, maxKeys: number = 100) {
    const client = createClient();
    const result = await client.list({
        prefix,
        'max-keys': maxKeys,
    }, {});

    return result.objects?.map(obj => ({
        name: obj.name,
        url: obj.url,
        size: obj.size,
        lastModified: obj.lastModified,
    })) || [];
}

// MIME类型映射
function getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
        // 图片
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        // 视频
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
        webm: 'video/webm',
        // 音频
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        // 文档
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}
