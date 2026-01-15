'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'wechat'>('email');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // 模拟登录
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = '/dashboard';
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
                <CardHeader className="space-y-1 text-center pb-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="size-4" />
                        返回首页
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
                    <CardDescription>登录你的SoloMedia账号</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* 登录方式切换 */}
                    <div className="flex rounded-lg bg-muted p-1">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'email'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm'
                                    : 'text-muted-foreground'
                                }`}
                            onClick={() => setLoginMethod('email')}
                        >
                            邮箱登录
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'wechat'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm'
                                    : 'text-muted-foreground'
                                }`}
                            onClick={() => setLoginMethod('wechat')}
                        >
                            微信登录
                        </button>
                    </div>

                    {loginMethod === 'email' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="邮箱地址"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="密码"
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-muted-foreground">记住我</span>
                                </label>
                                <Link href="/forgot-password" className="text-violet-600 hover:underline">
                                    忘记密码？
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        登录中...
                                    </>
                                ) : (
                                    '登录'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {/* 微信扫码登录 */}
                            <div className="flex flex-col items-center py-6">
                                <div className="size-48 bg-white rounded-xl border-2 border-dashed border-muted flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="size-32 mx-auto mb-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                            <svg className="size-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098c.877.249 1.823.382 2.799.382 4.8 0 8.691-3.288 8.691-7.342 0-4.054-3.891-7.344-8.691-7.344zm10.048 2.813c-1.13 0-2.194.267-3.15.737 1.75 2.108 2.833 4.727 2.833 7.598v.192c3.34-.936 5.728-4.18 5.728-7.972 0-4.516-3.86-8.188-8.611-8.188-3.252 0-6.061 1.727-7.593 4.284.587-.076 1.182-.116 1.79-.116.568 0 1.121.04 1.664.104a8.11 8.11 0 0 1 2.339-.336c4.8 0 8.69 3.288 8.69 7.342 0 .235-.015.468-.037.699-.008.068.033.135.092.167l.125.053c.072 0 .134-.049.161-.12l.347-1.327a.58.58 0 0 1 .211-.329c1.703-1.278 2.792-3.168 2.792-5.27 0-3.84-3.43-6.955-7.661-6.955z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-muted-foreground">微信扫码登录</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4">
                                    打开微信扫一扫，快速登录
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">或</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        还没有账号？{' '}
                        <Link href="/register" className="text-violet-600 hover:underline font-medium">
                            免费注册
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
