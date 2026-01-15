# 🚀 SoloMedia - 个人自媒体运营中心

> **"一人军团"的AI驱动多平台内容运营SaaS**

帮助个体创作者以最低成本实现专业级多平台运营，让每一个人都能成为高效的内容创业者。

---

## 📸 产品预览

### Dashboard 运营总览
![Dashboard](apps/web/public/screenshots/dashboard.png)

### 数据分析看板
![Analytics](apps/web/public/screenshots/analytics.png)

---

## 💡 项目愿景

在自媒体时代，个人创作者面临着巨大挑战：

| 痛点 | 描述 | SoloMedia解决 |
|------|------|---------------|
| 🔥 多平台分散 | 抖音、小红书、B站...需要逐一管理 | ✅ 一个后台管理所有 |
| ⏰ 时间不足 | 创作、发布、分析占用大量时间 | ✅ AI辅助节省80% |
| 📊 数据孤岛 | 各平台数据无法统一查看 | ✅ 统一数据看板 |
| 💰 成本限制 | 专业工具订阅费高昂 | ✅ 免费起步，按需付费 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Next.js 16, React 19, TailwindCSS, Shadcn/UI, TipTap |
| **后端** | Hono, Node.js 20, TypeScript |
| **数据库** | PostgreSQL + Drizzle ORM |
| **AI服务** | 阿里云通义千问 (OpenAI SDK兼容) |
| **部署** | Docker, Nginx, 阿里云ECS |

---

## 📁 项目结构

```
solopreneur/
├── apps/
│   ├── web/              # Next.js Web应用
│   ├── api/              # Hono API服务
│   └── miniprogram/      # 微信小程序
├── packages/
│   ├── ai/               # AI服务 (OpenAI SDK + Qwen)
│   ├── database/         # Drizzle ORM
│   └── shared/           # 共享类型
└── deploy/               # Docker配置
```

---

## 🚀 快速开始

```bash
# 安装pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 启动开发
pnpm dev

# 访问
# Web: http://localhost:3000
```

---

## 🛣️ 产品蓝图

- [x] MVP核心UI
- [x] AI服务对接
- [x] 编辑器组件
- [ ] 数据库连接
- [ ] 平台OAuth
- [ ] 生产部署

---

## 📄 License

MIT
