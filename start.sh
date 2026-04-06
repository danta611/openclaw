#!/bin/bash

# 商城报价系统启动脚本

echo "🚀 启动商城报价系统..."

# 启动后端
echo "📦 启动后端服务器..."
cd "$(dirname "$0")/backend"
pkill -f "node server.js" 2>/dev/null || true
nohup node server.js > /tmp/quotation-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 2

# 启动前端
echo "🎨 启动前端开发服务器..."
cd "$(dirname "$0")/frontend"
pkill -f "vite" 2>/dev/null || true
nohup npm run dev > /tmp/quotation-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端已启动 (PID: $FRONTEND_PID)"

# 等待启动完成
sleep 3

echo ""
echo "======================================"
echo "✨ 商城报价系统启动完成！"
echo "======================================"
echo ""
echo " 前端地址：http://localhost:3002"
echo "📍 后端地址：http://localhost:3001"
echo ""
echo "📋 查看日志:"
echo "  前端：tail -f /tmp/quotation-frontend.log"
echo "  后端：tail -f /tmp/quotation-backend.log"
echo ""
echo "🛑 停止服务：./stop.sh"
echo ""
