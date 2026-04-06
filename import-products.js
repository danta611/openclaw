
const fs = require('fs');
const path = require('path');

// 先停止服务，避免数据库锁定
console.log('🚀 开始导入商品数据...');

// 读取腾讯文档的商品数据
const quoteProductsPath = path.join(__dirname, '../quote-system/products.json');
const quoteProducts = JSON.parse(fs.readFileSync(quoteProductsPath, 'utf8'));

// 分类映射 - 把腾讯文档的分类对应到数据库分类
const categoryMap = {
  '动力系统': 1,
  '制动刹车': 2,
  '灯光照明': 3,
  '外观车架': 8,
  '减震舒适': 5,
  '操控显示': 7,
  '轮胎轮毂': 4,
  '实用强化': 8
};

// 子分类映射
const subCategoryMap = {
  '动力系统': {
    '高性能轮毂电机': 11,
    '中置电机': 11,
    '智能可编程控制器': 12,
    '大容量锂电池组': 13,
    '电池换芯升级': 13,
    '汽油增程器': 11
  },
  '制动刹车': {
    '前后碟刹套件': 21,
    '浮动碟刹盘': 21,
    '钢喉刹车油管': 21,
    '陶瓷刹车片': 22
  },
  '灯光照明': {
    '强光透镜大灯': 31,
    '流水转向灯': 32,
    '爆闪尾灯': 32,
    'LED 射灯': 31
  },
  '轮胎轮毂': {
    '半热熔真空胎': 41,
    '越野防滑胎': 41,
    '锻造铝合金轮毂': 42
  }
};

// 生成商品规格描述
function generateSpecs(product) {
  const specs = [];
  if (product.model) specs.push(`型号：${product.model}`);
  if (product.stock !== undefined) specs.push(`库存：${product.stock}`);
  if (product.note) specs.push(product.note);
  return specs.join(' | ');
}

// 准备 SQL 插入语句
const sqlStatements = [];

quoteProducts.forEach(product => {
  const parentCategoryId = categoryMap[product.category] || 8;
  let categoryId = parentCategoryId;
  
  // 尝试匹配子分类
  if (subCategoryMap[product.category] && subCategoryMap[product.category][product.name]) {
    categoryId = subCategoryMap[product.category][product.name];
  }
  
  const description = product.note || '';
  const specs = generateSpecs(product);
  const stockStatus = product.status || '有货';
  
  sqlStatements.push({
    sql: `INSERT INTO products (name, description, price, category_id, stock_status, specs) VALUES (?, ?, ?, ?, ?, ?)`,
    params: [product.name, description, product.price, categoryId, stockStatus, specs]
  });
});

console.log(`📦 准备导入 ${sqlStatements.length} 个商品`);

// 现在连接数据库并导入
const initSqlJs = require('sql.js');
const DB_PATH = path.join(__dirname, 'backend/quotation.db');

async function importData() {
  const SQL = await initSqlJs();
  
  // 加载现有数据库
  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    console.error('❌ 数据库文件不存在！');
    process.exit(1);
  }
  
  // 清空现有商品（可选，先备份）
  const backupPath = path.join(__dirname, `backend/quotation-backup-${Date.now()}.db`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`💾 已备份数据库到: ${backupPath}`);
  
  // 清空商品表
  db.run('DELETE FROM products');
  
  // 插入新商品
  sqlStatements.forEach(({ sql, params }) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  });
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log('✅ 商品导入成功！');
  
  // 验证
  const result = db.exec('SELECT COUNT(*) as count FROM products');
  console.log(`📊 当前数据库商品数量: ${result[0].values[0][0]}`);
}

importData().catch(console.error);
