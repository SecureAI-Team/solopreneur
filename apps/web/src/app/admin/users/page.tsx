'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Users, Search, MoreVertical, Ban, CheckCircle,
    Crown, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    phone: string;
    nickname: string;
    avatar: string;
    plan: string;
    isAdmin: boolean;
    isDisabled: boolean;
    lastLoginAt: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.admin.users({ page, limit });
            if (res.success) {
                setUsers(res.data.users);
                setTotal(res.data.pagination.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const res = await api.admin.updateUser(userId, updates);
            if (res.success) {
                toast.success('用户已更新');
                loadUsers();
            } else {
                toast.error(res.error || '更新失败');
            }
        } catch (e) {
            toast.error('操作失败');
        }
    };

    const filteredUsers = search
        ? users.filter(u =>
            u.nickname?.includes(search) ||
            u.email?.includes(search) ||
            u.phone?.includes(search)
        )
        : users;

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">用户管理</h1>
                    <p className="text-muted-foreground">管理平台用户账户</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    共 {total} 位用户
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索用户..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-muted-foreground">
                                        <th className="pb-3 font-medium">用户</th>
                                        <th className="pb-3 font-medium">联系方式</th>
                                        <th className="pb-3 font-medium">套餐</th>
                                        <th className="pb-3 font-medium">状态</th>
                                        <th className="pb-3 font-medium">注册时间</th>
                                        <th className="pb-3 font-medium">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="group">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                        {user.nickname?.slice(0, 1) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.nickname || '未设置'}</p>
                                                        {user.isAdmin && (
                                                            <Badge className="bg-amber-500 text-xs">管理员</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-muted-foreground">
                                                {user.email || user.phone || '-'}
                                            </td>
                                            <td className="py-4">
                                                <Badge variant="outline" className="capitalize">
                                                    {user.plan || 'free'}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                {user.isDisabled ? (
                                                    <Badge variant="destructive">已禁用</Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500">正常</Badge>
                                                )}
                                            </td>
                                            <td className="py-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateUser(user.id, { plan: 'pro' })}
                                                        >
                                                            <Crown className="size-4 mr-2" />
                                                            升级为 Pro
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateUser(user.id, { isDisabled: !user.isDisabled })}
                                                        >
                                                            {user.isDisabled ? (
                                                                <>
                                                                    <CheckCircle className="size-4 mr-2" />
                                                                    启用账户
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Ban className="size-4 mr-2" />
                                                                    禁用账户
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                第 {page} 页，共 {totalPages} 页
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
