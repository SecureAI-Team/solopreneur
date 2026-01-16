
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, Link2, PenLine, Send } from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
    id: string;
    label: string;
    description: string;
    icon: any;
    href: string;
    isCompleted: boolean;
    actionLabel: string;
}

interface OnboardingGuideProps {
    stats: {
        connectedPlatforms: number;
        totalContent: number;
        totalPublished: number;
    };
}

export function OnboardingGuide({ stats }: OnboardingGuideProps) {
    const steps: OnboardingStep[] = [
        {
            id: 'connect',
            label: '连接你的第一个账号',
            description: '绑定抖音、小红书等平台，开启一站式管理',
            icon: Link2,
            href: '/settings',
            isCompleted: stats.connectedPlatforms > 0,
            actionLabel: '去连接'
        },
        {
            id: 'create',
            label: '创作第一篇内容',
            description: '使用AI辅助创作，或直接上传现有素材',
            icon: PenLine,
            href: '/content/create',
            isCompleted: stats.totalContent > 0,
            actionLabel: '去创作'
        },
        {
            id: 'publish',
            label: '发布并查看数据',
            description: '一键分发到多平台，并通过看板查看效果',
            icon: Send,
            href: '/content/create', // Redirect to create to encourage publishing
            isCompleted: stats.totalPublished > 0,
            actionLabel: '去发布'
        }
    ];

    const completedCount = steps.filter(s => s.isCompleted).length;
    const progress = (completedCount / steps.length) * 100;

    if (completedCount === steps.length) return null; // Hide if all done

    return (
        <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-950 dark:to-violet-950/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>开始你的创作之旅 🚀</CardTitle>
                        <CardDescription>只需3步，即可解锁 SoloMedia 的全部潜力</CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-violet-600">{Math.round(progress)}%</span>
                        <p className="text-xs text-muted-foreground">完成度</p>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`relative p-4 rounded-xl border transition-all ${step.isCompleted
                                ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900'
                                : 'bg-white/50 border-border hover:border-violet-200 dark:bg-accent/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg ${step.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary text-foreground'}`}>
                                    <step.icon className="size-5" />
                                </div>
                                {step.isCompleted ? (
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                ) : (
                                    <Circle className="size-5 text-muted-foreground/30" />
                                )}
                            </div>
                            <h3 className={`font-semibold ${step.isCompleted ? 'text-emerald-900 dark:text-emerald-100' : ''}`}>
                                {step.label}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4 h-10">
                                {step.description}
                            </p>

                            {!step.isCompleted && (
                                <Link href={step.href}>
                                    <Button size="sm" className="w-full gap-2" variant="outline">
                                        {step.actionLabel}
                                        <ArrowRight className="size-3" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
