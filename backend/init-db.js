const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quotation.db');

async function initDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  // 创建表
  db.run(`
    -- 分类表
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    );

    -- 商品表
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      stock_status TEXT DEFAULT '有货',
      specs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- 报价单表
    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_no TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'draft',
      payment_terms TEXT DEFAULT '银行转账，30 天账期',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 报价单明细表
    CREATE TABLE IF NOT EXISTS quotation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_specs TEXT,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // 插入电动自行车配件分类
  const categories = [
    // 一级分类
    [1, '动力系统', null],
    [2, '制动系统', null],
    [3, '灯光照明', null],
    [4, '轮胎轮毂', null],
    [5, '减震系统', null],
    [6, '仪表盘', null],
    [7, '操控系统', null],
    [8, '实用配件', null],
    
    // 二级分类
    [11, '电机', 1], [12, '控制器', 1], [13, '电池', 1], [14, '充电器', 1],
    [21, '碟刹', 2], [22, '刹车片', 2], [23, '刹车油', 2],
    [31, '大灯', 3], [32, '转向灯', 3], [33, '氛围灯', 3],
    [41, '轮胎', 4], [42, '轮毂', 4],
    [51, '前叉减震', 5], [52, '后减震', 5],
    [61, '液晶屏', 6], [62, '电量表', 6],
    [71, '油门转把', 7], [72, '刹车手柄', 7],
    [81, '货架尾箱', 8], [82, '手机支架', 8], [83, '防盗器', 8],
  ];
  
  categories.forEach(cat => {
    const parentId = cat[2] !== null ? cat[2] : 'NULL';
    db.run(`INSERT INTO categories (id, name, parent_id) VALUES (${cat[0]}, '${cat[1]}', ${parentId})`);
  });

  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log('✅ 数据库创建成功');
  console.log('分类数量:', categories.length, '个');
}

initDatabase().catch(console.error);
