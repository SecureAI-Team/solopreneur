import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db, users, systemConfig, planConfig, adminLogs } from '../db';
import { eq, desc, like, or, sql } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const adminRoutes = new Hono();

// Admin authentication middleware
async function requireAdmin(c: any, next: any) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ success: false, error: '未授权' }, 401);
    }

    try {
        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user || !user.isAdmin) {
            return c.json({ success: false, error: '需要管理员权限' }, 403);
        }

        c.set('adminId', userId);
        await next();
    } catch {
        return c.json({ success: false, error: 'Token无效' }, 401);
    }
}

// Apply admin middleware to all routes
adminRoutes.use('*', requireAdmin);

// =====================
// Dashboard Overview
// =====================
adminRoutes.get('/dashboard', async (c) => {
    try {
        // Get user statistics
        const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
        const activeUsers = await db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(sql`${users.lastLoginAt} > datetime('now', '-7 days')`);
        const disabledUsers = await db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.isDisabled, true));

        // Get plan distribution
        const planDistribution = await db.select({
            plan: users.plan,
            count: sql<number>`count(*)`
        }).from(users).groupBy(users.plan);

        return c.json({
            success: true,
            data: {
                totalUsers: totalUsers[0]?.count || 0,
                activeUsers7d: activeUsers[0]?.count || 0,
                disabledUsers: disabledUsers[0]?.count || 0,
                planDistribution
            }
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// =====================
// User Management
// =====================
adminRoutes.get('/users', async (c) => {
    const { search, plan, status, page = '1', limit = '20' } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        let query = db.select().from(users).orderBy(desc(users.createdAt));

        // Apply filters would need dynamic query building
        // For now, return all users with pagination
        const allUsers = await db.query.users.findMany({
            limit: parseInt(limit),
            offset,
            orderBy: (users, { desc }) => [desc(users.createdAt)],
        });

        const total = await db.select({ count: sql<number>`count(*)` }).from(users);

        return c.json({
            success: true,
            data: {
                users: allUsers.map(u => ({
                    id: u.id,
                    email: u.email,
                    phone: u.phone,
                    nickname: u.nickname,
                    avatar: u.avatar,
                    plan: u.plan,
                    isAdmin: u.isAdmin,
                    isDisabled: u.isDisabled,
                    lastLoginAt: u.lastLoginAt,
                    createdAt: u.createdAt,
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total[0]?.count || 0
                }
            }
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// Update user
adminRoutes.patch('/users/:id', async (c) => {
    const userId = c.req.param('id');
    const adminId = c.get('adminId');
    const body = await c.req.json();
    const { plan, isDisabled, isAdmin } = body;

    try {
        const updateData: any = { updatedAt: new Date() };
        if (plan !== undefined) updateData.plan = plan;
        if (isDisabled !== undefined) updateData.isDisabled = isDisabled;
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

        await db.update(users).set(updateData).where(eq(users.id, userId));

        // Log the action
        await db.insert(adminLogs).values({
            adminId,
            action: 'user.update',
            targetType: 'user',
            targetId: userId,
            details: body,
        });

        return c.json({ success: true, message: '用户已更新' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// =====================
// System Configuration
// =====================
adminRoutes.get('/config', async (c) => {
    try {
        const configs = await db.query.systemConfig.findMany({
            orderBy: (sc, { asc }) => [asc(sc.category), asc(sc.key)],
        });

        return c.json({
            success: true,
            data: configs.map(cfg => ({
                id: cfg.id,
                key: cfg.key,
                value: cfg.isSecret ? '••••••••' : cfg.value, // Hide secrets
                isSecret: cfg.isSecret,
                category: cfg.category,
                description: cfg.description,
            }))
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// Update or create config
adminRoutes.post('/config', async (c) => {
    const adminId = c.get('adminId');
    const { key, value, isSecret, category, description } = await c.req.json();

    if (!key) {
        return c.json({ success: false, error: 'Key is required' }, 400);
    }

    try {
        const existing = await db.query.systemConfig.findFirst({
            where: eq(systemConfig.key, key),
        });

        if (existing) {
            await db.update(systemConfig)
                .set({ value, isSecret, category, description, updatedAt: new Date() })
                .where(eq(systemConfig.key, key));
        } else {
            await db.insert(systemConfig).values({
                key,
                value,
                isSecret,
                category,
                description,
            });
        }

        // Log the action
        await db.insert(adminLogs).values({
            adminId,
            action: 'config.update',
            targetType: 'config',
            targetId: key,
            details: { category },
        });

        return c.json({ success: true, message: '配置已保存' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// Batch update configs
adminRoutes.post('/config/batch', async (c) => {
    const adminId = c.get('adminId');
    const { configs } = await c.req.json();

    if (!Array.isArray(configs)) {
        return c.json({ success: false, error: 'configs must be an array' }, 400);
    }

    try {
        for (const cfg of configs) {
            const existing = await db.query.systemConfig.findFirst({
                where: eq(systemConfig.key, cfg.key),
            });

            if (existing) {
                // Only update value if provided (don't overwrite with empty string for secrets)
                const updateData: any = { updatedAt: new Date() };
                if (cfg.value !== undefined && cfg.value !== '••••••••') {
                    updateData.value = cfg.value;
                }
                if (cfg.isSecret !== undefined) updateData.isSecret = cfg.isSecret;
                if (cfg.category !== undefined) updateData.category = cfg.category;
                if (cfg.description !== undefined) updateData.description = cfg.description;

                await db.update(systemConfig)
                    .set(updateData)
                    .where(eq(systemConfig.key, cfg.key));
            } else {
                await db.insert(systemConfig).values({
                    key: cfg.key,
                    value: cfg.value,
                    isSecret: cfg.isSecret,
                    category: cfg.category,
                    description: cfg.description,
                });
            }
        }

        // Log the action
        await db.insert(adminLogs).values({
            adminId,
            action: 'config.batch_update',
            targetType: 'config',
            details: { count: configs.length },
        });

        return c.json({ success: true, message: `${configs.length} 项配置已保存` });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// =====================
// Plan Management
// =====================
adminRoutes.get('/plans', async (c) => {
    try {
        const plans = await db.query.planConfig.findMany({
            orderBy: (pc, { asc }) => [asc(pc.price)],
        });

        return c.json({ success: true, data: plans });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

adminRoutes.post('/plans', async (c) => {
    const adminId = c.get('adminId');
    const body = await c.req.json();
    const { planId, name, price, maxPlatforms, maxPostsPerMonth, features, isActive } = body;

    try {
        const existing = await db.query.planConfig.findFirst({
            where: eq(planConfig.planId, planId),
        });

        if (existing) {
            await db.update(planConfig)
                .set({ name, price, maxPlatforms, maxPostsPerMonth, features, isActive, updatedAt: new Date() })
                .where(eq(planConfig.planId, planId));
        } else {
            await db.insert(planConfig).values({
                planId,
                name,
                price,
                maxPlatforms,
                maxPostsPerMonth,
                features,
                isActive,
            });
        }

        await db.insert(adminLogs).values({
            adminId,
            action: 'plan.update',
            targetType: 'plan',
            targetId: planId,
            details: body,
        });

        return c.json({ success: true, message: '套餐已保存' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

// =====================
// Admin Logs
// =====================
adminRoutes.get('/logs', async (c) => {
    const { page = '1', limit = '50' } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        const logs = await db.query.adminLogs.findMany({
            limit: parseInt(limit),
            offset,
            orderBy: (al, { desc }) => [desc(al.createdAt)],
            with: {
                // Note: would need relations defined for this
            },
        });

        return c.json({ success: true, data: logs });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default adminRoutes;
