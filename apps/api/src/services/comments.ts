
/**
 * Mock Comment Service
 * Aggregates comments from all connected platforms
 */

interface Comment {
    id: string;
    platform: 'wechat' | 'douyin' | 'xiaohongshu' | 'bilibili';
    content: string;
    author: {
        name: string;
        avatar: string;
    };
    createdAt: string;
    isReplied: boolean;
    postTitle: string;
}

export async function getInboxComments(userId: string): Promise<Comment[]> {
    // In a real app, this would query the DB or call platform APIs
    // For MVP, we generate mock comments

    const comments: Comment[] = [
        {
            id: 'c1',
            platform: 'douyin',
            content: '这个视频拍得太好了！求教程🔥',
            author: { name: '狂热粉丝', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans1' },
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            isReplied: false,
            postTitle: '如何通过AI提高效率？'
        },
        {
            id: 'c2',
            platform: 'xiaohongshu',
            content: '集美，这个封面是用什么做的呀？好精致！',
            author: { name: '也就是个路人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans2' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            isReplied: true,
            postTitle: '我的2025年度计划'
        },
        {
            id: 'c3',
            platform: 'bilibili',
            content: '三连了，up主加油！',
            author: { name: '白嫖怪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans3' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            isReplied: false,
            postTitle: 'Docker 入门实战'
        },
        {
            id: 'c4',
            platform: 'wechat',
            content: '文章很有深度，已转发支持。',
            author: { name: '老读者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fans4' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            isReplied: true,
            postTitle: '独立开发的辛酸泪'
        }
    ];

    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
