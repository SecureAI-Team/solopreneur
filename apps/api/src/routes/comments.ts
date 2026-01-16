
import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getInboxComments } from '../services/comments';

export const commentRoutes = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get unified inbox comments
commentRoutes.get('/', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return c.json({ success: false, error: 'Unauthorized' }, 401);
        }

        const token = authHeader.slice(7);
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const userId = payload.userId as string;

        const comments = await getInboxComments(userId);

        return c.json({
            success: true,
            data: comments
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});
