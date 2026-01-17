import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Sparkles, TrendingUp, Clock, Zap,
    ArrowRight, CheckCircle, Star
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            {/* 导航栏 */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                SoloMedia
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">功能</a>
                            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">定价</a>
                            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">常见问题</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost">登录</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                    免费注册
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-sm mb-8">
                        <Sparkles className="size-4" />
                        AI驱动的自媒体运营平台
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        让<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">「一人军团」</span>
                        <br />也能拥有专业团队的运营能力
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        一个后台管理所有平台，AI辅助完成80%的日常运营工作，
                        让每一位个体创作者都能高效运营
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-12 px-8 text-lg">
                                免费开始使用
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                查看演示
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            免费使用
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            无需信用卡
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            5分钟上手
                        </div>
                    </div>
                </div>
            </section>

            {/* 产品截图 */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-2xl border bg-white/50 dark:bg-slate-900/50 shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-100 dark:bg-slate-800">
                            <div className="size-3 rounded-full bg-red-400" />
                            <div className="size-3 rounded-full bg-amber-400" />
                            <div className="size-3 rounded-full bg-green-400" />
                        </div>
                        <img
                            src="/screenshots/dashboard.png"
                            alt="SoloMedia Dashboard"
                            className="w-full"
                        />
                    </div>
                </div>
            </section>

            {/* 功能特点 */}
            <section id="features" className="py-20 px-4 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            为个人创作者量身打造
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            解决自媒体人最头疼的问题，让你专注于内容创作
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: 'AI智能选题',
                                desc: '根据热点和你的风格，AI推荐最佳选题',
                                color: 'text-violet-500',
                                bg: 'bg-violet-100',
                            },
                            {
                                icon: Zap,
                                title: '一键多平台发布',
                                desc: '写一次内容，自动适配多个平台格式',
                                color: 'text-amber-500',
                                bg: 'bg-amber-100',
                            },
                            {
                                icon: TrendingUp,
                                title: '数据统一分析',
                                desc: '所有平台数据汇总，一眼看清运营全貌',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-100',
                            },
                            {
                                icon: Clock,
                                title: '节省80%时间',
                                desc: 'AI辅助创作，把时间留给真正重要的事',
                                color: 'text-blue-500',
                                bg: 'bg-blue-100',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800 hover:shadow-lg transition-all">
                                <div className={`size-12 rounded-xl ${feature.bg} dark:bg-opacity-20 flex items-center justify-center mb-4`}>
                                    <feature.icon className={`size-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 新手起步教练 */}
            <section className="py-20 px-4 bg-gradient-to-br from-indigo-900 to-violet-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 blur-3xl" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-violet-200 text-sm mb-6 border border-white/20">
                                <Star className="size-4 text-amber-400" />
                                专注「从0到1」起步困难
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                没有方向？让 AI 教练带你起飞
                            </h2>
                            <p className="text-lg text-violet-100 mb-8 leading-relaxed">
                                不知道发什么？不懂排版？没人看？SoloMedia 特有的「新手教练」模式，
                                通过独家 <strong>Content DNA</strong> 技术，帮你找到最适合你的赛道。
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <TrendingUp className="size-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Niche 赛道分析</h3>
                                        <p className="text-violet-200">AI分析你的兴趣与优势，推荐蓝海赛道</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="size-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Content DNA 定制</h3>
                                        <p className="text-violet-200">打造你独一无二的内容风格与人设</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <CheckCircle className="size-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">保姆级起号指南</h3>
                                        <p className="text-violet-200">每日任务清单，手把手教你度过冷启动期</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <Link href="/onboarding">
                                    <Button size="lg" className="bg-white text-indigo-900 hover:bg-violet-50 h-12 px-8 font-semibold">
                                        开始我的起号之旅
                                        <ArrowRight className="ml-2 size-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-700">
                                {/* Mock UI Card */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500" />
                                    <div>
                                        <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                                        <div className="h-3 w-20 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-white/10 rounded" />
                                    <div className="h-4 w-5/6 bg-white/10 rounded" />
                                    <div className="h-4 w-4/6 bg-white/10 rounded" />
                                </div>
                                <div className="mt-6 p-4 rounded-xl bg-indigo-950/50 border border-white/10">
                                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                                        <Sparkles className="size-4" />
                                        AI 教练建议
                                    </div>
                                    <p className="text-sm text-violet-200">
                                        你的账号风格偏向「治愈系」，建议尝试 "下班后的独处时间" 话题，
                                        并在封面使用暖色调。已为你生成 3 个备选标题...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 定价 */}
            <section id="pricing" className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">简单透明的定价</h2>
                        <p className="text-lg text-muted-foreground">从免费开始，按需升级</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: '免费版',
                                price: '¥0',
                                period: '/月',
                                features: ['1个平台', '基础AI功能', '7天数据保留'],
                                cta: '免费开始',
                                popular: false,
                            },
                            {
                                name: '个人版',
                                price: '¥29',
                                period: '/月',
                                features: ['3个平台', '完整AI功能', '30天数据保留', '优先客服'],
                                cta: '立即订阅',
                                popular: true,
                            },
                            {
                                name: '专业版',
                                price: '¥99',
                                period: '/月',
                                features: ['无限平台', '高级分析', '永久数据', '专属顾问'],
                                cta: '联系我们',
                                popular: false,
                            },
                        ].map((plan, i) => (
                            <div
                                key={i}
                                className={`p-8 rounded-2xl border ${plan.popular
                                    ? 'border-violet-500 bg-gradient-to-b from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 relative'
                                    : 'bg-white dark:bg-slate-900'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs rounded-full flex items-center gap-1">
                                            <Star className="size-3" /> 最受欢迎
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="size-4 text-emerald-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : ''}`}
                                    variant={plan.popular ? 'default' : 'outline'}
                                >
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 常见问题 */}
            <section id="faq" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">常见问题</h2>
                        <p className="text-lg text-muted-foreground">了解更多关于 SoloMedia 的信息</p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            {
                                q: "支持哪些媒体平台？",
                                a: "目前我们支持抖音、小红书、B站、微信公众号等主流平台。未来还将支持快手、微博等更多渠道。"
                            },
                            {
                                q: "免费版有功能限制吗？",
                                a: "免费版支持绑定1个平台账号，可以使用基础的AI创作和数据查看功能。对于刚起步的创作者完全够用。"
                            },
                            {
                                q: "如何保证账号安全？",
                                a: "我们使用官方开放平台接口或安全的RPA技术，所有敏感数据（如Token）均经过企业级加密存储，绝不泄露。"
                            },
                            {
                                q: "可以在手机上使用吗？",
                                a: "当然可以！我们的网页端完全适配移动设备，同时微信小程序版本也即将上线，方便您随时随地管理内容。"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-2 flex items-start gap-2">
                                    <span className="text-violet-600 font-bold">Q.</span>
                                    {item.q}
                                </h3>
                                <p className="text-muted-foreground ml-6 leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="font-semibold">SoloMedia</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 SoloMedia. 让每一位创作者都能轻松运营
                    </p>
                </div>
            </footer>
        </div>
    );
}
