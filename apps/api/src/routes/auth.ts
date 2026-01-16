import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
const { hash, compare } = bcrypt;
import { loginSchema, registerSchema, wxLoginSchema } from '@solomedia/shared';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export const authRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 注册
authRoutes.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const validated = registerSchema.parse(body);

        // 检查用户是否已存在
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, validated.email),
        });

        if (existingUser) {
            return c.json({ success: false, error: '该邮箱已被注册' }, 400);
        }

        const hashedPassword = await hash(validated.password, 10);

        // 保存用户到数据库
        const [user] = await db.insert(users).values({
            email: validated.email,
            phone: validated.phone,
            password: hashedPassword,
            nickname: validated.nickname || '新用户',
            plan: 'free',
        }).returning();

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    plan: user.plan
                },
                token
            },
            message: '注册成功',
        });
    } catch (error: any) {
        console.error('Registration error:', error);
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

        // 从数据库查询用户
        const user = await db.query.users.findFirst({
            where: eq(users.email, validated.email),
        });

        if (!user || !user.password) {
            return c.json({ success: false, error: '邮箱或密码错误' }, 401);
        }

        // 验证密码
        const isValid = await compare(validated.password, user.password);
        if (!isValid) {
            return c.json({ success: false, error: '邮箱或密码错误' }, 401);
        }

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    plan: user.plan
                },
                token
            },
            message: '登录成功',
        });
    } catch (error: any) {
        console.error('Login error:', error);
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

        // 模拟微信OpenID (暂时代替真实API调用)
        const wxOpenId = `mock_openid_${code.slice(0, 10)}`;

        // 查找或创建用户
        let user = await db.query.users.findFirst({
            where: eq(users.wxOpenId, wxOpenId),
        });

        if (!user) {
            [user] = await db.insert(users).values({
                wxOpenId,
                nickname: '微信用户',
                plan: 'free',
            }).returning();
        }

        const token = await sign({ userId: user.id }, JWT_SECRET);

        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    wxOpenId: user.wxOpenId,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    plan: user.plan
                },
                token
            },
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
        const payload = await verify(token, JWT_SECRET, 'HS256');

        // 从数据库查询用户
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId as string),
        });

        if (!user) {
            return c.json({ success: false, error: '用户不存在' }, 404);
        }

        return c.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                plan: user.plan
            }
        });
    } catch {
        return c.json({ success: false, error: 'Token无效' }, 401);
    }
});
