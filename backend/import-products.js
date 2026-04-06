
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

console.log('🚀 开始导入商品数据...');

// 读取腾讯文档的商品数据
const quoteProductsPath = path.join(__dirname, '../../quote-system/products.json');
const quoteProducts = JSON.parse(fs.readFileSync(quoteProductsPath, 'utf8'));

// 分类映射
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

function generateSpecs(product) {
  const specs = [];
  if (product.model) specs.push(`型号：${product.model}`);
  if (product.stock !== undefined) specs.push(`库存：${product.stock}`);
  if (product.note) specs.push(product.note);
  return specs.join(' | ');
}

const DB_PATH = path.join(__dirname, 'quotation.db');

async function importData() {
  const SQL = await initSqlJs();
  
  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    console.error('❌ 数据库文件不存在！');
    process.exit(1);
  }
  
  const backupPath = path.join(__dirname, `quotation-backup-${Date.now()}.db`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`💾 已备份数据库到: ${backupPath}`);
  
  db.run('DELETE FROM products');
  
  quoteProducts.forEach(product => {
    const parentCategoryId = categoryMap[product.category] || 8;
    let categoryId = parentCategoryId;
    
    if (subCategoryMap[product.category] && subCategoryMap[product.category][product.name]) {
      categoryId = subCategoryMap[product.category][product.name];
    }
    
    const description = product.note || '';
    const specs = generateSpecs(product);
    const stockStatus = product.status || '有货';
    const model = product.model || '';
    
    const stmt = db.prepare(
      'INSERT INTO products (name, description, price, category_id, stock_status, specs, model) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.bind([product.name, description, product.price, categoryId, stockStatus, specs, model]);
    stmt.step();
    stmt.free();
  });
  
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log('✅ 商品导入成功！');
  
  const result = db.exec('SELECT COUNT(*) as count FROM products');
  console.log(`📊 当前数据库商品数量: ${result[0].values[0][0]}`);
}

importData().catch(console.error);
