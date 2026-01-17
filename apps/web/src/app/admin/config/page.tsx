'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Settings, Eye, EyeOff, Save, Loader2,
    Server, Brain, Database, Key, ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ConfigItem {
    id?: string;
    key: string;
    value: string;
    isSecret: boolean;
    category: string;
    description: string;
}

const CONFIG_GROUPS = [
    {
        category: 'ai',
        title: 'AI 服务配置',
        icon: Brain,
        color: 'text-violet-500',
        items: [
            { key: 'DASHSCOPE_API_KEY', label: '阿里云 DashScope API Key', isSecret: true, description: '通义千问、通义万相等AI服务' },
            { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', isSecret: true, description: 'GPT等OpenAI服务(备用)' },
        ]
    },
    {
        category: 'storage',
        title: '存储配置',
        icon: Database,
        color: 'text-emerald-500',
        items: [
            { key: 'OSS_ACCESS_KEY_ID', label: 'OSS Access Key ID', isSecret: false, description: '阿里云OSS访问密钥ID' },
            { key: 'OSS_ACCESS_KEY_SECRET', label: 'OSS Access Key Secret', isSecret: true, description: '阿里云OSS访问密钥Secret' },
            { key: 'OSS_BUCKET', label: 'OSS Bucket', isSecret: false, description: 'OSS存储桶名称' },
            { key: 'OSS_REGION', label: 'OSS Region', isSecret: false, description: 'OSS区域，如 oss-cn-hangzhou' },
            { key: 'OSS_ENDPOINT', label: 'OSS Endpoint', isSecret: false, description: 'OSS访问域名' },
        ]
    },
    {
        category: 'other',
        title: '其他配置',
        icon: Server,
        color: 'text-orange-500',
        items: [
            { key: 'JWT_SECRET', label: 'JWT Secret', isSecret: true, description: 'JWT签名密钥' },
            { key: 'DOMAIN', label: '网站域名', isSecret: false, description: '网站访问域名，如 https://your-domain.com' },
        ]
    },
];

export default function AdminConfigPage() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const res = await api.admin.getConfig();
            if (res.success && res.data) {
                const configMap: Record<string, string> = {};
                res.data.forEach((c: ConfigItem) => {
                    configMap[c.key] = c.value;
                });
                setConfigs(configMap);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveGroup = async (category: string) => {
        const group = CONFIG_GROUPS.find(g => g.category === category);
        if (!group) return;

        setSaving(category);
        try {
            const configsToSave = group.items.map(item => ({
                key: item.key,
                value: configs[item.key] || '',
                isSecret: item.isSecret,
                category: category,
                description: item.description,
            })).filter(c => c.value && !c.value.includes('••••'));

            const res = await api.admin.saveConfigBatch(configsToSave);
            if (res.success) {
                toast.success(`${group.title} 配置已保存`);
            } else {
                toast.error(res.error || '保存失败');
            }
        } catch (e) {
            toast.error('保存出错');
        } finally {
            setSaving(null);
        }
    };

    const toggleShowSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
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
                <h1 className="text-3xl font-bold">系统配置</h1>
                <p className="text-muted-foreground">配置平台级别的API密钥和服务参数</p>
            </div>

            {CONFIG_GROUPS.map((group) => (
                <Card key={group.category}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <group.icon className={`size-5 ${group.color}`} />
                                <div>
                                    <CardTitle>{group.title}</CardTitle>
                                    <CardDescription>
                                        {group.items.length} 项配置
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSaveGroup(group.category)}
                                disabled={saving === group.category}
                                className="gap-2"
                            >
                                {saving === group.category ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                保存
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {group.items.map((item) => (
                                <div key={item.key} className="space-y-2">
                                    <Label htmlFor={item.key} className="flex items-center gap-2">
                                        {item.label}
                                        {item.isSecret && (
                                            <Badge variant="secondary" className="text-xs">敏感</Badge>
                                        )}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id={item.key}
                                            type={item.isSecret && !showSecrets[item.key] ? 'password' : 'text'}
                                            placeholder={item.description}
                                            value={configs[item.key] || ''}
                                            onChange={(e) => handleChange(item.key, e.target.value)}
                                            className="pr-10"
                                        />
                                        {item.isSecret && (
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                onClick={() => toggleShowSecret(item.key)}
                                            >
                                                {showSecrets[item.key] ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Help */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">配置说明</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>平台OAuth凭证：在各平台开放平台注册应用后获得</li>
                        <li>AI服务配置：阿里云控制台 → DashScope → API-KEY</li>
                        <li>存储配置：阿里云控制台 → 对象存储OSS</li>
                        <li>敏感值保存后将加密存储，再次查看时会显示为遮罩</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
