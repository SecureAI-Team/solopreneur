'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, ArrowRight, ArrowLeft, Check, Target, Users, Palette,
    Rocket, Lightbulb, TrendingUp, Heart, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// Step data
const INTERESTS = [
    { id: 'cooking', label: '美食烹饪', emoji: '🍳' },
    { id: 'tech', label: '科技数码', emoji: '📱' },
    { id: 'fitness', label: '健身运动', emoji: '💪' },
    { id: 'travel', label: '旅行探索', emoji: '✈️' },
    { id: 'fashion', label: '穿搭时尚', emoji: '👗' },
    { id: 'gaming', label: '游戏电竞', emoji: '🎮' },
    { id: 'parenting', label: '育儿亲子', emoji: '👶' },
    { id: 'finance', label: '理财投资', emoji: '💰' },
    { id: 'education', label: '知识教育', emoji: '📚' },
    { id: 'lifestyle', label: '生活方式', emoji: '🏠' },
];

const SKILLS = [
    { id: 'writing', label: '文案写作', emoji: '✍️' },
    { id: 'video', label: '视频拍摄', emoji: '🎬' },
    { id: 'design', label: '设计审美', emoji: '🎨' },
    { id: 'speaking', label: '口才表达', emoji: '🎤' },
    { id: 'research', label: '资料搜集', emoji: '🔍' },
    { id: 'humor', label: '幽默搞笑', emoji: '😂' },
];

const AUDIENCES = [
    { id: 'students', label: '学生党', desc: '18-24岁，追求性价比' },
    { id: 'workers', label: '职场人', desc: '25-35岁，关注效率和成长' },
    { id: 'parents', label: '宝爸宝妈', desc: '育儿、家庭生活' },
    { id: 'seniors', label: '银发族', desc: '50+，健康养生' },
    { id: 'creators', label: '同行创作者', desc: '自媒体运营技巧' },
];

const STYLES = [
    { id: 'energetic', label: '活力搞笑', emoji: '🤪', desc: '快节奏、表情包、梗' },
    { id: 'calm', label: '温柔治愈', emoji: '🌸', desc: '慢节奏、氛围感' },
    { id: 'expert', label: '专业硬核', emoji: '🧠', desc: '数据、干货、深度' },
    { id: 'story', label: '故事型', emoji: '📖', desc: '娓娓道来、情感共鸣' },
    { id: 'casual', label: '随性真实', emoji: '😊', desc: 'Vlog风、生活记录' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customInterest, setCustomInterest] = useState('');
    const [selectedAudience, setSelectedAudience] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<string>('');

    // AI Results
    const [nicheResult, setNicheResult] = useState<any>(null);
    const [dnaResult, setDnaResult] = useState<any>(null);

    const totalSteps = 4;

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleNext = async () => {
        if (step === 1) {
            // Generate niche analysis
            if (selectedInterests.length === 0) {
                toast.error('请至少选择一个兴趣领域');
                return;
            }
            setIsLoading(true);
            try {
                const interestLabels = selectedInterests.map(id =>
                    INTERESTS.find(i => i.id === id)?.label || id
                );
                const skillLabels = selectedSkills.map(id =>
                    SKILLS.find(s => s.id === id)?.label || id
                );

                if (customInterest) {
                    interestLabels.push(customInterest);
                }

                const res = await api.ai.generateNicheAnalysis({
                    interests: interestLabels,
                    skills: skillLabels,
                    timeAvailable: '每周10小时'
                });

                if (res.success && res.data) {
                    setNicheResult(res.data);
                }
            } catch (e) {
                console.error(e);
                toast.error('AI分析出错，请重试');
            } finally {
                setIsLoading(false);
            }
            setStep(2);
        } else if (step === 2) {
            // Move to audience selection
            setStep(3);
        } else if (step === 3) {
            if (!selectedAudience) {
                toast.error('请选择目标受众');
                return;
            }
            setStep(4);
        } else if (step === 4) {
            // Generate Content DNA
            if (!selectedStyle) {
                toast.error('请选择内容风格');
                return;
            }
            setIsLoading(true);
            try {
                const niche = nicheResult?.[0]?.niche || selectedInterests[0];
                const res = await api.ai.generateContentDNA({ niche });

                if (res.success && res.data) {
                    setDnaResult(res.data);

                    // Get labels for interests and skills
                    const interestLabels = selectedInterests.map(id =>
                        INTERESTS.find(i => i.id === id)?.label || id
                    );
                    const skillLabels = selectedSkills.map(id =>
                        SKILLS.find(s => s.id === id)?.label || id
                    );
                    const audienceLabel = AUDIENCES.find(a => a.id === selectedAudience)?.label || selectedAudience;
                    const styleLabel = STYLES.find(s => s.id === selectedStyle)?.label || selectedStyle;

                    // Save profile to backend
                    const profileRes = await api.auth.updateProfile({
                        niche,
                        interests: interestLabels,
                        skills: skillLabels,
                        audience: audienceLabel,
                        style: styleLabel,
                        contentDNA: res.data
                    });

                    if (profileRes.success) {
                        toast.success('🎉 账号定位保存成功！');
                    } else {
                        toast.error('保存失败，但您可以稍后在设置中更新');
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error('生成或保存时出错');
            } finally {
                setIsLoading(false);
            }

            // Redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
                <div
                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            <div className="container max-w-3xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="size-4" />
                        AI 新手起步向导
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        {step === 1 && '发现你的赛道 🎯'}
                        {step === 2 && '分析你的定位 📊'}
                        {step === 3 && '明确目标受众 👥'}
                        {step === 4 && '确定内容风格 🎨'}
                    </h1>
                    <p className="text-muted-foreground">
                        步骤 {step} / {totalSteps}
                    </p>
                </div>

                {/* Step 1: Interests & Skills */}
                {step === 1 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="size-5 text-violet-500" />
                                选择你的兴趣领域
                            </CardTitle>
                            <CardDescription>选择1-3个你最感兴趣的方向</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map(item => (
                                    <Badge
                                        key={item.id}
                                        variant={selectedInterests.includes(item.id) ? 'default' : 'outline'}
                                        className={`cursor-pointer px-4 py-2 text-sm transition-all ${selectedInterests.includes(item.id)
                                            ? 'bg-violet-500 hover:bg-violet-600'
                                            : 'hover:bg-violet-50 dark:hover:bg-violet-900/30'
                                            }`}
                                        onClick={() => toggleInterest(item.id)}
                                    >
                                        {item.emoji} {item.label}
                                    </Badge>
                                ))}
                            </div>

                            <div>
                                <Input
                                    placeholder="其他 (自定义)..."
                                    value={customInterest}
                                    onChange={(e) => setCustomInterest(e.target.value)}
                                    className="max-w-xs"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Lightbulb className="size-4 text-amber-500" />
                                    你擅长什么？(可选)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {SKILLS.map(item => (
                                        <Badge
                                            key={item.id}
                                            variant={selectedSkills.includes(item.id) ? 'default' : 'outline'}
                                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${selectedSkills.includes(item.id)
                                                ? 'bg-amber-500 hover:bg-amber-600'
                                                : 'hover:bg-amber-50 dark:hover:bg-amber-900/30'
                                                }`}
                                            onClick={() => toggleSkill(item.id)}
                                        >
                                            {item.emoji} {item.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Niche Results */}
                {step === 2 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-green-500" />
                                AI 推荐赛道
                            </CardTitle>
                            <CardDescription>基于你的兴趣和技能，AI 推荐以下赛道</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {nicheResult && Array.isArray(nicheResult) ? (
                                nicheResult.map((niche: any, index: number) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-lg">{niche.niche}</h3>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    难度 {niche.difficulty}%
                                                </Badge>
                                                <Badge className="bg-green-500 text-xs">
                                                    潜力 {niche.potential}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{niche.reason}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Zap className="size-8 mx-auto mb-2 animate-pulse" />
                                    正在分析中...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Audience Selection */}
                {step === 3 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="size-5 text-blue-500" />
                                选择目标受众
                            </CardTitle>
                            <CardDescription>你的内容主要想吸引哪类人群？</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {AUDIENCES.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedAudience(item.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedAudience === item.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedAudience === item.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                                            }`}>
                                            {selectedAudience === item.id && <Check className="size-3 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-sm text-muted-foreground">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Style Selection */}
                {step === 4 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="size-5 text-pink-500" />
                                选择内容风格
                            </CardTitle>
                            <CardDescription>你希望传递什么样的内容氛围？</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {STYLES.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedStyle(item.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedStyle === item.id
                                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                            : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-2xl">{item.emoji}</div>
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-sm text-muted-foreground">{item.desc}</div>
                                        </div>
                                        {selectedStyle === item.id && (
                                            <Check className="size-5 text-pink-500 ml-auto" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* DNA Result Preview */}
                            {dnaResult && (
                                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Rocket className="size-4" />
                                        你的 Content DNA
                                    </h4>
                                    <div className="grid gap-2 text-sm">
                                        <div><strong>人设:</strong> {dnaResult.persona}</div>
                                        <div><strong>视觉风格:</strong> {dnaResult.visualStyle}</div>
                                        <div><strong>语言调性:</strong> {dnaResult.voice}</div>
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded mt-2">
                                            <strong>简介:</strong> {dnaResult.bio}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isLoading}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        上一步
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="gap-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                    >
                        {isLoading ? (
                            <>
                                <Zap className="size-4 animate-pulse" />
                                AI 分析中...
                            </>
                        ) : step === totalSteps ? (
                            <>
                                <Check className="size-4" />
                                完成设置
                            </>
                        ) : (
                            <>
                                下一步
                                <ArrowRight className="size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
