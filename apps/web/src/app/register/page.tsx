'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // 模拟注册
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
                <Card className="w-full max-w-md text-center shadow-2xl border-0">
                    <CardContent className="pt-12 pb-8">
                        <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="size-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">注册成功！</h2>
                        <p className="text-muted-foreground mb-6">
                            欢迎加入SoloMedia，开始你的自媒体运营之旅
                        </p>
                        <Link href="/dashboard">
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                进入运营中心
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
                    <CardDescription>免费注册，立即开始使用</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="用户名"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
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
                                    placeholder="密码 (至少8位)"
                                    className="pl-10 pr-10"
                                    required
                                    minLength={8}
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

                        <div className="text-sm text-muted-foreground">
                            <label className="flex items-start gap-2">
                                <input type="checkbox" className="rounded mt-1" required />
                                <span>
                                    我已阅读并同意{' '}
                                    <Link href="/terms" className="text-violet-600 hover:underline">服务条款</Link>
                                    {' '}和{' '}
                                    <Link href="/privacy" className="text-violet-600 hover:underline">隐私政策</Link>
                                </span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                    注册中...
                                </>
                            ) : (
                                '免费注册'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">或</span>
                        </div>
                    </div>

                    {/* 微信注册 */}
                    <Button variant="outline" className="w-full gap-2">
                        <svg className="size-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098c.877.249 1.823.382 2.799.382 4.8 0 8.691-3.288 8.691-7.342 0-4.054-3.891-7.344-8.691-7.344z" />
                        </svg>
                        微信快捷注册
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        已有账号？{' '}
                        <Link href="/login" className="text-violet-600 hover:underline font-medium">
                            立即登录
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
