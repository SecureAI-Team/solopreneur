'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, Sparkles } from 'lucide-react';

// 官方微信图标
const WeChatIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.04-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.358-8.596-6.358z" />
    </svg>
);

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 size-80 bg-emerald-200 dark:bg-emerald-900 rounded-full blur-3xl opacity-30" />
                    <div className="absolute -bottom-40 -left-40 size-80 bg-violet-200 dark:bg-violet-900 rounded-full blur-3xl opacity-30" />
                </div>
                <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur relative z-10">
                    <CardContent className="pt-12 pb-8">
                        <div className="size-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                            <CheckCircle className="size-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">🎉 注册成功！</h2>
                        <p className="text-muted-foreground mb-8">
                            欢迎加入SoloMedia，开始你的自媒体运营之旅
                        </p>
                        <div className="space-y-3">
                            <Link href="/dashboard">
                                <Button className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                                    <Sparkles className="size-4 mr-2" />
                                    进入运营中心
                                </Button>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                我们已向您的邮箱发送了欢迎邮件
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 size-80 bg-violet-200 dark:bg-violet-900 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-40 -left-40 size-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-30" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                <CardHeader className="space-y-1 text-center pb-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="size-4" />
                        返回首页
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-500/25">
                            S
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
                    <CardDescription>免费注册，立即开始使用</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* 微信快捷注册 */}
                    <Button variant="outline" className="w-full h-11 gap-2 border-[#07C160] text-[#07C160] hover:bg-[#07C160]/10 hover:text-[#07C160]">
                        <WeChatIcon className="size-5" />
                        微信快捷注册
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">或使用邮箱注册</span>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="用户名"
                                    className="pl-10 h-11 bg-muted/50"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="邮箱地址"
                                    className="pl-10 h-11 bg-muted/50"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="密码 (至少8位)"
                                    className="pl-10 pr-10 h-11 bg-muted/50"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-muted-foreground/30 mt-1" required />
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
                            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
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

                    <p className="text-center text-sm text-muted-foreground">
                        已有账号？{' '}
                        <Link href="/login" className="text-violet-600 hover:text-violet-700 hover:underline font-medium transition-colors">
                            立即登录
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
