'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ... (WeChatIcon remains same)
const WeChatIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.04-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.358-8.596-6.358zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229a8.94 8.94 0 0 0 2.473-.357.7.7 0 0 1 .588.08l1.56.909a.262.262 0 0 0 .137.044c.131 0 .237-.108.237-.241 0-.06-.023-.117-.038-.174l-.32-1.211a.483.483 0 0 1 .175-.543C23.157 18.697 24 17.177 24 15.466c0-3.221-2.93-5.845-6.562-6.608h-.5zM14.186 14.042c.526 0 .953.432.953.966s-.427.967-.953.967a.96.96 0 0 1-.953-.967c0-.534.427-.966.953-.966zm4.768 0c.526 0 .953.432.953.966s-.427.967-.953.967a.96.96 0 0 1-.953-.967c0-.534.427-.966.953-.966z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'wechat'>('email');
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.auth.login(formData);
            if (res.success && res.data) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user)); // 简单的用户信息存储
                toast.success('登录成功');
                router.push('/dashboard');
            } else {
                toast.error(res.error || '登录失败，请检查邮箱和密码');
            }
        } catch (error) {
            toast.error('登录出错，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
            {/* ... (background remains same) */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 size-80 bg-violet-200 dark:bg-violet-900 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-40 -left-40 size-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-30" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                <CardHeader className="space-y-1 text-center pb-2">
                    {/* ... (Header remains same) */}
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="size-4" />
                        返回首页
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-500/25">
                            S
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
                    <CardDescription>登录你的SoloMedia账号</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* 登录方式切换 */}
                    <div className="flex rounded-xl bg-muted p-1">
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email'
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setLoginMethod('email')}
                        >
                            邮箱登录
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${loginMethod === 'wechat'
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setLoginMethod('wechat')}
                        >
                            <WeChatIcon className="size-4" />
                            微信登录
                        </button>
                    </div>

                    {loginMethod === 'email' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="邮箱地址"
                                        className="pl-10 h-11 bg-muted/50"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="密码"
                                        className="pl-10 pr-10 h-11 bg-muted/50"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
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

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-muted-foreground/30" />
                                    <span className="text-muted-foreground">记住我</span>
                                </label>
                                <Link href="/forgot-password" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors">
                                    忘记密码？
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
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
                                <div className="relative">
                                    {/* 二维码外框 */}
                                    <div className="size-52 bg-white rounded-2xl border-2 border-[#07C160] p-3 shadow-lg">
                                        {/* 模拟二维码 */}
                                        <div className="size-full bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                                            {/* 二维码纹理 */}
                                            <div className="absolute inset-4 grid grid-cols-8 gap-0.5">
                                                {Array.from({ length: 64 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'} rounded-[1px]`}
                                                    />
                                                ))}
                                            </div>
                                            {/* 中心微信Logo */}
                                            <div className="relative size-12 bg-[#07C160] rounded-lg flex items-center justify-center z-10 shadow-md">
                                                <WeChatIcon className="size-7 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* 角标装饰 */}
                                    <div className="absolute -top-2 -left-2 size-4 border-t-2 border-l-2 border-[#07C160] rounded-tl-lg" />
                                    <div className="absolute -top-2 -right-2 size-4 border-t-2 border-r-2 border-[#07C160] rounded-tr-lg" />
                                    <div className="absolute -bottom-2 -left-2 size-4 border-b-2 border-l-2 border-[#07C160] rounded-bl-lg" />
                                    <div className="absolute -bottom-2 -right-2 size-4 border-b-2 border-r-2 border-[#07C160] rounded-br-lg" />
                                </div>

                                <div className="mt-6 text-center">
                                    <div className="flex items-center justify-center gap-2 text-[#07C160] font-medium">
                                        <WeChatIcon className="size-5" />
                                        <span>微信扫码登录</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        打开微信 → 扫一扫 → 快速登录
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">或</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        还没有账号？{' '}
                        <Link href="/register" className="text-violet-600 hover:text-violet-700 hover:underline font-medium transition-colors">
                            免费注册
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
