#!/bin/bash

# 商城报价系统停止脚本

echo "🛑 停止商城报价系统..."

pkill -f "node server.js" 2>/dev/null && echo "✅ 后端已停止"
pkill -f "vite" 2>/dev/null && echo "✅ 前端已停止"

echo "✨ 所有服务已停止"
