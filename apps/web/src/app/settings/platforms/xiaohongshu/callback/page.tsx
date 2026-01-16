
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function XiaohongshuCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setStatus('error');
            setErrorMsg('未获取到扫码凭证');
            return;
        }

        const connect = async () => {
            try {
                const res = await api.platforms.connectXiaohongshu(code);
                if (res.success) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/settings');
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMsg(res.error || '连接失败');
                }
            } catch (error: any) {
                setStatus('error');
                setErrorMsg(error.message || '连接出错');
            }
        };

        connect();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6 border border-slate-200 dark:border-slate-800">
                {status === 'loading' && (
                    <>
                        <Loader2 className="size-12 animate-spin text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold">正在连接小红书...</h2>
                        <p className="text-muted-foreground">模拟RPA扫码验证中</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="size-12 text-green-500 mx-auto" />
                        <h2 className="text-xl font-bold">连接成功！</h2>
                        <p className="text-muted-foreground">小红书账号已成功连接 (Mock RPA)</p>
                        <p className="text-sm text-muted-foreground">即将返回设置页面...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="size-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold">连接失败</h2>
                        <p className="text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg text-sm">
                            {errorMsg}
                        </p>
                        <Button onClick={() => router.push('/settings')} className="w-full">
                            返回设置
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
