'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PenLine, Image, Video, FileText, Loader2, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '昨天';
    return `${diffDays}天前`;
}

const contentIcons: Record<string, any> = {
    video: Video,
    article: Image,
    long_text: FileText,
    free: PenLine,
};

export default function ContentListPage() {
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchContents = async () => {
        try {
            const res = await api.content.list({});
            if (res.success && res.data) {
                setContents(res.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("加载内容失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('确定要删除这个内容吗？此操作不可恢复。')) return;

        setDeleting(id);
        try {
            const res = await api.content.delete(id);
            if (res.success) {
                toast.success('删除成功');
                fetchContents();
            } else {
                toast.error(res.error || '删除失败');
            }
        } catch (e) {
            console.error(e);
            toast.error('删除失败');
        } finally {
            setDeleting(null);
        }
    };

    const getIcon = (type: string) => {
        return contentIcons[type] || FileText;
    };

    return (
        <DashboardLayout title="全部内容" breadcrumbs={[{ label: "内容工作台", href: "/content" }, { label: "全部内容" }]}>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>内容列表</CardTitle>
                            <CardDescription>共 {contents.length} 个内容</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : contents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                暂无内容
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contents.map((content) => {
                                    const Icon = getIcon(content.type);
                                    return (
                                        <Link
                                            key={content.id}
                                            href={`/content/create?id=${content.id}`}
                                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Icon className="size-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{content.title || '无标题'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Badge variant="outline" className="text-xs">{content.status === 'published' ? '已发布' : '草稿'}</Badge>
                                                        <span>•</span>
                                                        <span>{formatTimeAgo(content.updatedAt || content.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleDelete(content.id, e)}
                                                    disabled={deleting === content.id}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    {deleting === content.id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    编辑
                                                </Button>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
