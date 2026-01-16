#!/bin/bash

# SoloMedia One-Click Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting SoloMedia Deployment..."

# 1. Check for .env.production
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and fill in your values."
    exit 1
fi

# 2. Load environment variables
export $(cat .env.production | xargs)

echo "📦 Building Docker images..."
docker-compose -f docker-compose.yml build

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml down

echo "▶️ Starting services..."
docker-compose -f docker-compose.yml up -d

echo "⏳ Waiting for services to initialize..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.yml exec -T api npm run db:push

echo "✅ Deployment Complete!"
echo "Web: http://localhost:3000 (or your server IP)"
echo "API: http://localhost:3001 (or your server IP)"
