'use client';

import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, Download, Sparkles } from 'lucide-react';

export function ToolModeOnboarding() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeen = localStorage.getItem('solomedia_tool_mode_onboarding');
        if (!hasSeen) {
            // Small delay to not conflict with other popups
            setTimeout(() => setOpen(true), 1500);
        }
    }, []);

    const handleComplete = () => {
        setOpen(false);
        localStorage.setItem('solomedia_tool_mode_onboarding', 'true');
    };

    const handleNext = () => setStep(s => s + 1);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleComplete()}>
            <DialogContent className="max-w-2xl">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                欢迎来到全新"工具模式" 🛠️
                            </DialogTitle>
                            <DialogDescription className="text-base pt-2">
                                我们对平台进行了重大升级！为了保障您的账号安全，SoloMedia 现已转型为<b>纯辅助工具</b>。
                                <br />不再需要授权账号密码，更安全、更自由。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Card className="bg-violet-50 dark:bg-violet-950/50 border-violet-200">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-violet-900 dark:text-violet-100">专注内容创作</h4>
                                        <p className="text-sm text-violet-700 dark:text-violet-300">
                                            使用 AI 润色、智能排版，打造爆款内容。
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100">无缝复制发布</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            一键复制格式化内容，直接粘贴到各大平台创作中心。
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleNext} className="w-full sm:w-auto">
                                下一步：如何使用插件
                                <ChevronRight className="size-4 ml-1" />
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                🚀 安装浏览器助手
                            </DialogTitle>
                            <DialogDescription>
                                为了获得最佳体验，请安装 Chrome 浏览器插件，实现<b>一键自动填充</b>。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary text-primary-foreground size-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                                    <p>下载插件包并解压到本地文件夹。</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary text-primary-foreground size-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                                    <p>打开 Chrome 扩展程序管理页面 (chrome://extensions)。</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary text-primary-foreground size-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                                    <p>开启右上角"开发者模式"，点击"加载已解压的扩展程序"。</p>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 text-sm">
                                💡 <b>使用技巧：</b> 在创作页面点击"去发布" -> 插件自动同步 -> 前往抖音/小红书网页版 -> 点击悬浮球 "🤖 填充" 即可。
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => window.open('/extension-download', '_blank')}>
                                <Download className="size-4 mr-2" />
                                下载插件包
                            </Button>
                            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                                我明白了，开始创作
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
