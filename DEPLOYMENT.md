# 🌐 商城报价系统 - 公网部署完成

## 🎉 公网访问链接

**https://busy-wolves-invent.loca.lt**

---

## ⚠️ 重要提示

**首次访问时需要点击确认按钮！**

这是 localtunnel 的安全机制，防止自动爬取。点击后即可正常访问系统。

---

## 📋 部署信息

| 项目 | 详情 |
|------|------|
| 公网 URL | https://busy-wolves-invent.loca.lt |
| 服务器 IP | 62.234.29.89 |
| 本地端口 | 80 (nginx) |
| 后端端口 | 3001 |
| 前端构建 | /var/www/html |

---

## 🚀 服务管理

### 查看服务状态
```bash
# 查看 nginx 状态
systemctl status nginx

# 查看后端进程
ps aux | grep "node server.js"

# 查看 tunnel 进程
ps aux | grep localtunnel
```

### 重启服务
```bash
# 重启 nginx
sudo systemctl restart nginx

# 重启后端
pkill -f "node server.js"
cd /root/.openclaw/workspace/quotation-system/backend
nohup node server.js > /tmp/quotation-backend.log 2>&1 &

# 重启 tunnel (URL 会变)
pkill -f localtunnel
cd /tmp && node -e "const lt = require('localtunnel'); lt({port: 80}).then(tunnel => console.log('URL:', tunnel.url));"
```

### 查看日志
```bash
# nginx 访问日志
tail -f /var/log/nginx/access.log

# nginx 错误日志
tail -f /var/log/nginx/error.log

# 后端日志
tail -f /tmp/quotation-backend.log
```

---

## 📁 项目位置

```
/root/.openclaw/workspace/quotation-system/  # 源代码
/var/www/html/                                # 前端构建文件
/etc/nginx/sites-available/quotation-system   # nginx 配置
```

---

## 🔧 技术架构

```
用户 → localtunnel 隧道 → nginx (80 端口) → 前端静态文件
                                      ↳ 反向代理 → 后端 API (3001 端口)
```

---

## ⚡ 快速测试 API

```bash
# 获取商品列表
curl https://busy-wolves-invent.loca.lt/api/products

# 获取分类
curl https://busy-wolves-invent.loca.lt/api/categories

# 创建报价单
curl -X POST https://busy-wolves-invent.loca.lt/api/quotations \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":2,"unit_price":129.99}]}'
```

---

## 📝 注意事项

1. **URL 变化**: localtunnel 免费版的 URL 每次重启会变化
2. **稳定性**: 适合测试和演示，生产环境建议使用固定域名
3. **数据安全**: 公网访问请注意数据保护

---

**部署时间**: 2026-04-01 19:39
**部署状态**: ✅ 运行中
