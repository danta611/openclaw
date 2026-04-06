#!/bin/bash

# 商城报价系统 - 公网访问启动脚本

echo "🚀 启动商城报价系统（公网访问版）..."

# 启动后端
echo "📦 启动后端服务器..."
cd "$(dirname "$0")/backend"
pkill -f "node server.js" 2>/dev/null || true
nohup node server.js > /tmp/quotation-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2
echo "✅ 后端已启动 (PID: $BACKEND_PID)"

# 启动前端
echo "🎨 启动前端开发服务器..."
cd "$(dirname "$0")/frontend"
pkill -f "vite" 2>/dev/null || true
nohup npm run dev > /tmp/quotation-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3
echo "✅ 前端已启动 (PID: $FRONTEND_PID)"

# 启动公网穿透
echo "🌐 启动公网穿透服务..."
pkill -f "lt --port" 2>/dev/null || true
nohup lt --port 3002 > /tmp/loca.lt.log 2>&1 &
TUNNEL_PID=$!
sleep 5

# 获取公网 URL
PUBLIC_URL=$(cat /tmp/loca.lt.log | grep "your url is:" | awk '{print $4}')

echo ""
echo "======================================"
echo "✨ 商城报价系统启动完成！"
echo "======================================"
echo ""
if [ -n "$PUBLIC_URL" ]; then
    echo "🌍 公网访问地址："
    echo "   ${PUBLIC_URL}"
    echo ""
    echo "   ⚠️ 首次访问需要点击确认按钮"
    echo ""
else
    echo "⚠️ 公网地址获取失败，请查看日志："
    echo "   cat /tmp/loca.lt.log"
    echo ""
fi
echo "📍 本地访问地址：http://localhost:3002"
echo "📍 后端 API 地址：http://localhost:3001"
echo ""
echo "📋 查看日志:"
echo "  穿透日志：cat /tmp/loca.lt.log"
echo "  前端日志：tail -f /tmp/quotation-frontend.log"
echo "  后端日志：tail -f /tmp/quotation-backend.log"
echo ""
echo "🛑 停止服务：./stop-public.sh"
echo ""
