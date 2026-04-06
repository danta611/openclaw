
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quotation.db');

let db = null;

// 拼音首字母映射（常用词）
const pinyinMap = {
  '动': 'D', '力': 'L', '系': 'X', '统': 'T',
  '制': 'Z', '灯': 'D', '光': 'G',
  '照': 'Z', '明': 'M', '轮': 'L', '胎': 'T',
  '毂': 'G', '减': 'J', '震': 'Z', '仪': 'Y',
  '表': 'B', '盘': 'P', '操': 'C', '控': 'K',
  '实': 'S', '用': 'Y', '配': 'P', '件': 'J',
  '电': 'D', '机': 'J', '器': 'Q', '池': 'C',
  '充': 'C', '碟': 'D', '刹': 'S', '车': 'C',
  '片': 'P', '油': 'Y', '大': 'D', '转': 'Z',
  '向': 'X', '氛': 'F', '围': 'W', '前': 'Q',
  '叉': 'C', '后': 'H', '液': 'Y', '晶': 'J',
  '量': 'L', '门': 'M', '把': 'B', '手': 'S',
  '柄': 'B', '货': 'H', '架': 'J', '尾': 'W',
  '箱': 'X', '支': 'Z', '防': 'F', '盗': 'D'
};

// 获取汉字首字母
function getPinyinInitial(char) {
  if (pinyinMap[char]) return pinyinMap[char];
  return char.toUpperCase();
}

// 生成目录缩写
function generateAbbreviation(name) {
  let abbr = '';
  for (let i = 0; i < name.length && abbr.length < 8; i++) {
    const char = name[i];
    if (/[\u4e00-\u9fa5]/.test(char)) {
      abbr += getPinyinInitial(char);
    } else if (/[a-zA-Z0-9]/.test(char)) {
      abbr += char.toUpperCase();
    }
  }
  return abbr || 'CATE';
}

// 初始化数据库
async function initDatabase() {
  const SQL = await initSqlJs();
  
  // 加载现有数据库或创建新数据库
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (error) {
    console.error('加载数据库失败，创建新数据库:', error);
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    -- 分类表
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      icon TEXT,
      abbreviation TEXT,
      sort_order INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
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
      model TEXT,
      product_no TEXT,
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

    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      identity TEXT DEFAULT '车友',
      level INTEGER DEFAULT 0,
      avatar TEXT,
      wechat TEXT,
      car_model TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 检查是否有初始数据
  const count = db.exec("SELECT count(*) FROM categories")[0];
  if (!count || count.values[0][0] === 0) {
    // 初始化电动自行车配件分类数据
    const categoriesData = [
      { id: 1, name: '动力系统', parent_id: null },
      { id: 2, name: '制动系统', parent_id: null },
      { id: 3, name: '灯光照明', parent_id: null },
      { id: 4, name: '轮胎轮毂', parent_id: null },
      { id: 5, name: '减震系统', parent_id: null },
      { id: 6, name: '仪表盘', parent_id: null },
      { id: 7, name: '操控系统', parent_id: null },
      { id: 8, name: '实用配件', parent_id: null },
      { id: 11, name: '电机', parent_id: 1 },
      { id: 12, name: '控制器', parent_id: 1 },
      { id: 13, name: '电池', parent_id: 1 },
      { id: 14, name: '充电器', parent_id: 1 },
      { id: 21, name: '碟刹', parent_id: 2 },
      { id: 22, name: '刹车片', parent_id: 2 },
      { id: 23, name: '刹车油', parent_id: 2 },
      { id: 31, name: '大灯', parent_id: 3 },
      { id: 32, name: '转向灯', parent_id: 3 },
      { id: 33, name: '氛围灯', parent_id: 3 },
      { id: 41, name: '轮胎', parent_id: 4 },
      { id: 42, name: '轮毂', parent_id: 4 },
      { id: 51, name: '前叉减震', parent_id: 5 },
      { id: 52, name: '后减震', parent_id: 5 },
      { id: 61, name: '液晶屏', parent_id: 6 },
      { id: 62, name: '电量表', parent_id: 6 },
      { id: 71, name: '油门转把', parent_id: 7 },
      { id: 72, name: '刹车手柄', parent_id: 7 },
      { id: 81, name: '货架尾箱', parent_id: 8 },
      { id: 82, name: '手机支架', parent_id: 8 },
      { id: 83, name: '防盗器', parent_id: 8 }
    ];

    categoriesData.forEach((cat, index) => {
      const abbreviation = generateAbbreviation(cat.name);
      const level = cat.parent_id ? 1 : 0;
      db.run(
        "INSERT INTO categories (id, name, parent_id, abbreviation, sort_order, level) VALUES (?, ?, ?, ?, ?, ?)",
        [cat.id, cat.name, cat.parent_id, abbreviation, index + 1, level]
      );
    });

    saveDatabase();
  }

  console.log('✅ 数据库初始化完成');
  return db;
}

// 保存数据库到文件
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// 自动保存（每 30 秒）
setInterval(() => {
  saveDatabase();
  console.log('💾 数据库已自动保存');
}, 30000);

// 查询辅助函数
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  return results;
}

// 执行辅助函数（返回最后插入的ID）
function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  
  // 获取最后插入的ID
  let lastId = 0;
  const idResult = db.exec("SELECT last_insert_rowid() as id");
  if (idResult && idResult.length > 0 && idResult[0].values.length > 0) {
    lastId = idResult[0].values[0][0];
  }
  
  stmt.free();
  saveDatabase();
  return lastId;
}

// 获取最后插入 ID（为了兼容保留）
function lastInsertRowid() {
  const result = db.exec("SELECT last_insert_rowid() as id");
  if (result && result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return 0;
}

module.exports = {
  initDatabase,
  query,
  execute,
  lastInsertRowid,
  saveDatabase,
  generateAbbreviation
};

