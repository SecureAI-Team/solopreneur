FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建共享包
WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/packages/database
RUN npm run build

# 构建API
WORKDIR /app/apps/api
RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# 复制构建产物
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=hono:nodejs /app/packages/shared/dist ./node_modules/@solomedia/shared/dist
COPY --from=builder --chown=hono:nodejs /app/packages/database/dist ./node_modules/@solomedia/database/dist

# 安装生产依赖
RUN corepack enable pnpm && pnpm install --prod

USER hono

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/index.js"]
