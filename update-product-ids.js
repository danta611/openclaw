
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'backend', 'quotation.db');

// 分类编码映射
const CATEGORY_CODES = {
  // 动力系统
  11: 'MOT', // 电机
  12: 'ECU', // 控制器
  13: 'BAT', // 电池
  14: 'CHG', // 充电器
  
  // 制动系统
  21: 'BRK', // 碟刹
  22: 'PAD', // 刹车片
  23: 'FLD', // 刹车油
  
  // 灯光照明
  31: 'LGT', // 大灯
  32: 'TUR', // 转向灯
  33: 'ATM', // 氛围灯
  
  // 轮胎轮毂
  41: 'TIR', // 轮胎
  42: 'WHL', // 轮毂
  
  // 减震系统
  51: 'FRK', // 前叉减震
  52: 'REK', // 后减震
  
  // 仪表盘
  61: 'LCD', // 液晶屏
  62: 'BAT', // 电量表（注意：和电池重复了，改成BMG）
  
  // 操控系统
  71: 'THR', // 油门转把
  72: 'BRH', // 刹车手柄
  
  // 实用配件
  81: 'RAC', // 货架尾箱
  82: 'PHN', // 手机支架
  83: 'ANT', // 防盗器
};

// 修正电量表编码
CATEGORY_CODES[62] = 'BMG';

async function updateProductIds() {
  try {
    const SQL = await initSqlJs();
    
    // 读取数据库
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);
    
    console.log('=== 开始更新商品ID ===');
    
    // 获取所有商品
    const products = db.exec('SELECT * FROM products ORDER BY id');
    if (!products || products.length === 0) {
      console.log('❌ 没有找到商品');
      return;
    }
    
    const productList = products[0].values;
    const columns = products[0].columns;
    
    console.log(`📦 找到 ${productList.length} 个商品`);
    
    // 按分类统计商品数量
    const categoryCounters = {};
    const newProductIds = [];
    
    productList.forEach((row, index) => {
      const product = {};
      columns.forEach((col, i) => {
        product[col] = row[i];
      });
      
      const categoryId = product.category_id;
      const categoryCode = CATEGORY_CODES[categoryId] || 'PRD';
      
      // 初始化分类计数器
      if (!categoryCounters[categoryCode]) {
        categoryCounters[categoryCode] = 0;
      }
      categoryCounters[categoryCode]++;
      
      // 生成新ID
      const newId = `${categoryCode}-${String(categoryCounters[categoryCode]).padStart(3, '0')}`;
      
      newProductIds.push({
        oldId: product.id,
        newId: newId,
        product: product
      });
      
      console.log(`  ${product.id} → ${newId} | ${product.name}`);
    });
    
    // 开始事务
    db.run('BEGIN TRANSACTION');
    
    try {
      // 1. 创建临时表
      db.run(`
        CREATE TABLE products_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category_id INTEGER,
          image_url TEXT,
          stock_status TEXT DEFAULT '有货',
          specs TEXT,
          model TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);
      
      // 2. 插入数据到新表
      newProductIds.forEach(({ oldId, newId, product }) => {
        db.run(`
          INSERT INTO products_new (id, name, description, price, category_id, image_url, stock_status, specs, model, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newId,
          product.name,
          product.description,
          product.price,
          product.category_id,
          product.image_url,
          product.stock_status,
          product.specs,
          product.model,
          product.created_at
        ]);
      });
      
      // 3. 删除旧表
      db.run('DROP TABLE products');
      
      // 4. 重命名新表
      db.run('ALTER TABLE products_new RENAME TO products');
      
      // 5. 提交事务
      db.run('COMMIT');
      
      console.log('✅ 商品ID更新成功！');
      
      // 保存数据库
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
      
      console.log('💾 数据库已保存');
      
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

updateProductIds();
