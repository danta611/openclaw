# 🛒 商城报价系统

严格按照设计稿实现的商城式报价系统，支持商品浏览、报价单生成、PDF 导出等功能。

## 📸 功能预览

- **商品目录** - 分类浏览、搜索、网格/列表视图切换
- **商品详情** - 规格参数、库存状态
- **报价单编辑** - 数量调整、实时计价
- **正式报价单** - 表格展示、PDF/图片导出

## 🚀 快速启动

### 方式一：本地访问

```bash
# 启动所有服务
./start.sh

# 停止所有服务
./stop.sh
```

- 前端：http://localhost:3002
- 后端：http://localhost:3001

### 方式二：公网访问

```bash
# 启动（含公网穿透）
./start-public.sh

# 停止
./stop-public.sh
```

启动后会显示公网 URL，例如：`https://xxx.loca.lt`

⚠️ **首次访问公网链接时需要点击确认按钮**

## 📁 项目结构

```
quotation-system/
├── backend/
│   ├── server.js          # Express 服务器
│   ├── database.js        # SQLite 数据库初始化
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── router/        # 路由配置
│   │   └── assets/        # 样式资源
│   └── package.json
└── public/
    └── uploads/           # 商品图片上传目录
```

## 🛠️ 技术栈

**前端**
- Vue 3 + Vite
- TailwindCSS
- Pinia (状态管理)
- Vue Router
- jsPDF + html2canvas (PDF/图片导出)

**后端**
- Node.js + Express
- SQLite (better-sqlite3)
- Multer (文件上传)

## 📋 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取分类树 |
| GET | /api/products | 获取商品列表 |
| GET | /api/products/:id | 获取商品详情 |
| POST | /api/quotations | 创建报价单 |
| GET | /api/quotations | 获取报价单列表 |
| GET | /api/quotations/:id | 获取报价单详情 |
| POST | /api/upload | 上传图片 |

## 🎨 设计还原

- ✅ 顶部品牌 Header
- ✅ 左侧分类树 + 右侧商品网格
- ✅ 搜索框 + 视图切换按钮
- ✅ 商品卡片（图片、名称、规格、价格、库存标签）
- ✅ 底部 Tab 导航（目录、报价单、订单、我的）
- ✅ 商品详情页（大图、规格参数、双按钮）
- ✅ 报价单编辑页（数量选择器、删除按钮、总价）
- ✅ 正式报价单（表格、报价单号、导出功能）

## 📝 注意事项

1. 首次运行会自动创建 SQLite 数据库和示例数据
2. 商品图片默认使用占位图，可通过后台管理上传
3. PDF 导出功能需要浏览器支持 canvas

---

**开发完成** 🐱 如有问题随时联系！
