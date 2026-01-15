#!/bin/bash
# SoloMedia 阿里云ECS初始化脚本
# 适用于Ubuntu 24.04 LTS

set -e

echo "🚀 开始初始化SoloMedia服务器..."

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装必要工具
echo "🔧 安装必要工具..."
apt install -y curl wget git htop vim ufw

# 安装Docker
echo "🐳 安装Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# 安装Docker Compose
echo "📦 安装Docker Compose..."
apt install -y docker-compose-plugin

# 启动Docker服务
systemctl enable docker
systemctl start docker

# 安装Nginx
echo "🌐 安装Nginx..."
apt install -y nginx

# 安装Certbot (Let's Encrypt)
echo "🔒 安装Certbot..."
apt install -y certbot python3-certbot-nginx

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /opt/solomedia
mkdir -p /var/www/certbot

# 创建swap空间（适用于小内存服务器）
echo "💾 创建swap空间..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "✅ 服务器初始化完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 将项目代码上传到 /opt/solomedia"
echo "2. 复制 deploy/.env.example 为 deploy/.env 并填入配置"
echo "3. 修改 deploy/nginx/nginx.conf 中的域名"
echo "4. 运行 deploy/scripts/deploy.sh 部署应用"
echo ""
echo "🔒 获取SSL证书:"
echo "certbot --nginx -d your-domain.com -d www.your-domain.com"
