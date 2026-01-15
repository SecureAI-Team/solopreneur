import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { hash, compare } from 'bcryptjs';
import { loginSchema, registerSchema, wxLoginSchema } from '@solomedia/shared';

export const authRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 注册
authRoutes.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const validated = registerSchema.parse(body);

        // TODO: 检查用户是否已存在
        // TODO: 保存用户到数据库

        const hashedPassword = await hash(validated.password, 10);

        // 模拟用户创建
        const user = {
            id: crypto.randomUUID(),
            email: validated.email,
            phone: validated.phone,
            nickname: validated.nickname || '新用户',
            plan: 'free',
            createdAt: new Date(),
        };

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: { user, token },
            message: '注册成功',
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || '注册失败',
        }, 400);
    }
});

// 登录
authRoutes.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const validated = loginSchema.parse(body);

        // TODO: 从数据库查询用户
        // TODO: 验证密码

        // 模拟登录
        const user = {
            id: crypto.randomUUID(),
            email: validated.email,
            phone: validated.phone,
            nickname: '创作者',
            avatar: null,
            plan: 'free',
            createdAt: new Date(),
        };

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: { user, token },
            message: '登录成功',
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || '登录失败',
        }, 400);
    }
});

// 微信小程序登录
authRoutes.post('/wx-login', async (c) => {
    try {
        const body = await c.req.json();
        const { code } = wxLoginSchema.parse(body);

        // TODO: 调用微信API获取openid
        // const wxResponse = await fetch(`https://api.weixin.qq.com/sns/jscode2session?...`);

        // 模拟微信登录
        const wxOpenId = `wx_${crypto.randomUUID().slice(0, 8)}`;

        // TODO: 查找或创建用户
        const user = {
            id: crypto.randomUUID(),
            wxOpenId,
            nickname: '微信用户',
            avatar: null,
            plan: 'free',
            createdAt: new Date(),
        };

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: { user, token },
            message: '微信登录成功',
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || '微信登录失败',
        }, 400);
    }
});

// 获取当前用户
authRoutes.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ success: false, error: '未授权' }, 401);
    }

    try {
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET);

        // TODO: 从数据库查询用户
        const user = {
            id: payload.userId,
            nickname: '创作者',
            plan: 'free',
        };

        return c.json({ success: true, data: user });
    } catch {
        return c.json({ success: false, error: 'Token无效' }, 401);
    }
});
