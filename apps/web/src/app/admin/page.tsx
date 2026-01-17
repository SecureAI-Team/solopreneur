'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardData {
    totalUsers: number;
    activeUsers7d: number;
    disabledUsers: number;
    planDistribution: Array<{ plan: string; count: number }>;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await api.admin.dashboard();
            if (res.success) {
                setData(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            title: '总用户数',
            value: data?.totalUsers || 0,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%'
        },
        {
            title: '7天活跃用户',
            value: data?.activeUsers7d || 0,
            icon: UserCheck,
            color: 'bg-green-500',
            change: '+8%'
        },
        {
            title: '已禁用用户',
            value: data?.disabledUsers || 0,
            icon: UserX,
            color: 'bg-red-500',
            change: '0'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">管理后台概览</h1>
                <p className="text-muted-foreground">平台运营数据一览</p>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="h-20 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        {stats.map((stat) => (
                            <Card key={stat.title}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                                            <p className="text-3xl font-bold">{stat.value}</p>
                                            <p className="text-xs text-emerald-500 mt-1">{stat.change} 本月</p>
                                        </div>
                                        <div className={`size-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                            <stat.icon className="size-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Plan Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5" />
                                套餐分布
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {(data?.planDistribution || []).map((item) => (
                                    <div
                                        key={item.plan}
                                        className="p-4 rounded-xl bg-muted/50 text-center"
                                    >
                                        <p className="text-2xl font-bold">{item.count}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{item.plan || 'free'}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
