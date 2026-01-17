'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Save, Loader2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Plan {
    id?: string;
    planId: string;
    name: string;
    price: number;
    maxPlatforms: number;
    maxPostsPerMonth: number;
    features: {
        aiPolish?: boolean;
        aiImage?: boolean;
        analytics?: boolean;
        automation?: boolean;
        prioritySupport?: boolean;
    };
    isActive: boolean;
}

const DEFAULT_PLANS: Plan[] = [
    {
        planId: 'free',
        name: '免费版',
        price: 0,
        maxPlatforms: 3,
        maxPostsPerMonth: 10,
        features: { aiPolish: true, aiImage: false, analytics: false, automation: false },
        isActive: true,
    },
    {
        planId: 'pro',
        name: '专业版',
        price: 9900, // 99元
        maxPlatforms: 6,
        maxPostsPerMonth: 100,
        features: { aiPolish: true, aiImage: true, analytics: true, automation: true },
        isActive: true,
    },
    {
        planId: 'enterprise',
        name: '企业版',
        price: 29900, // 299元
        maxPlatforms: -1, // 无限
        maxPostsPerMonth: -1,
        features: { aiPolish: true, aiImage: true, analytics: true, automation: true, prioritySupport: true },
        isActive: true,
    },
];

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const res = await api.admin.getPlans();
            if (res.success && res.data?.length > 0) {
                setPlans(res.data);
            } else {
                // Use default plans if none exist
                setPlans(DEFAULT_PLANS);
            }
        } catch (e) {
            console.error(e);
            setPlans(DEFAULT_PLANS);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (planId: string, field: string, value: any) => {
        setPlans(prev => prev.map(p => {
            if (p.planId === planId) {
                if (field.startsWith('features.')) {
                    const featureKey = field.split('.')[1];
                    return { ...p, features: { ...p.features, [featureKey]: value } };
                }
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const handleSave = async (plan: Plan) => {
        setSaving(plan.planId);
        try {
            const res = await api.admin.savePlan(plan);
            if (res.success) {
                toast.success(`${plan.name} 配置已保存`);
            } else {
                toast.error(res.error || '保存失败');
            }
        } catch (e) {
            toast.error('保存出错');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">套餐管理</h1>
                <p className="text-muted-foreground">配置各套餐的功能限制和价格</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.planId} className={plan.planId === 'pro' ? 'border-violet-500 shadow-lg' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className={`size-5 ${plan.planId === 'free' ? 'text-slate-500' :
                                            plan.planId === 'pro' ? 'text-violet-500' :
                                                'text-amber-500'
                                        }`} />
                                    <CardTitle>{plan.name}</CardTitle>
                                </div>
                                {plan.planId === 'pro' && (
                                    <Badge className="bg-violet-500">推荐</Badge>
                                )}
                            </div>
                            <CardDescription>
                                {plan.price === 0 ? '免费' : `¥${(plan.price / 100).toFixed(0)}/月`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label>月价格 (分)</Label>
                                    <Input
                                        type="number"
                                        value={plan.price}
                                        onChange={(e) => handleChange(plan.planId, 'price', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>平台数量限制</Label>
                                    <Input
                                        type="number"
                                        value={plan.maxPlatforms}
                                        onChange={(e) => handleChange(plan.planId, 'maxPlatforms', parseInt(e.target.value))}
                                        placeholder="-1 表示无限"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>每月发布数限制</Label>
                                    <Input
                                        type="number"
                                        value={plan.maxPostsPerMonth}
                                        onChange={(e) => handleChange(plan.planId, 'maxPostsPerMonth', parseInt(e.target.value))}
                                        placeholder="-1 表示无限"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t">
                                <Label className="text-sm font-medium">功能开关</Label>
                                {[
                                    { key: 'aiPolish', label: 'AI润色' },
                                    { key: 'aiImage', label: 'AI图片生成' },
                                    { key: 'analytics', label: '数据分析' },
                                    { key: 'automation', label: '自动化' },
                                    { key: 'prioritySupport', label: '优先支持' },
                                ].map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between">
                                        <span className="text-sm">{feature.label}</span>
                                        <Switch
                                            checked={plan.features[feature.key as keyof typeof plan.features] || false}
                                            onCheckedChange={(checked) => handleChange(plan.planId, `features.${feature.key}`, checked)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => handleSave(plan)}
                                disabled={saving === plan.planId}
                            >
                                {saving === plan.planId ? (
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="size-4 mr-2" />
                                )}
                                保存配置
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
