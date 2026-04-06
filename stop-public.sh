#!/bin/bash

# 商城报价系统 - 停止所有服务（包括公网穿透）

echo "🛑 停止商城报价系统..."

pkill -f "node server.js" 2>/dev/null && echo "✅ 后端已停止"
pkill -f "vite" 2>/dev/null && echo "✅ 前端已停止"
pkill -f "lt --port" 2>/dev/null && echo "✅ 公网穿透已停止"

echo "✨ 所有服务已停止"
