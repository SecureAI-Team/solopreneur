#!/bin/bash
# SoloMedia 部署脚本

set -e

PROJECT_DIR="/opt/solomedia"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "🚀 开始部署SoloMedia..."

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码（如果使用Git）
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull origin main
fi

# 加载环境变量
if [ -f "$DEPLOY_DIR/.env" ]; then
    export $(cat $DEPLOY_DIR/.env | grep -v '#' | xargs)
else
    echo "❌ 错误: 未找到 $DEPLOY_DIR/.env 文件"
    echo "请复制 .env.example 并填入配置"
    exit 1
fi

# 构建并启动容器
echo "🐳 构建Docker镜像..."
cd $DEPLOY_DIR
docker compose build

echo "🔄 重启服务..."
docker compose down
docker compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🏥 执行健康检查..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ API服务正常"
else
    echo "❌ API服务异常"
    docker compose logs api
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Web服务正常"
else
    echo "❌ Web服务异常"
    docker compose logs web
    exit 1
fi

# 复制Nginx配置
echo "🌐 更新Nginx配置..."
cp $DEPLOY_DIR/nginx/nginx.conf /etc/nginx/sites-available/solomedia
ln -sf /etc/nginx/sites-available/solomedia /etc/nginx/sites-enabled/

# 测试并重载Nginx
nginx -t
systemctl reload nginx

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
docker compose ps
echo ""
echo "📝 查看日志:"
echo "docker compose logs -f"
