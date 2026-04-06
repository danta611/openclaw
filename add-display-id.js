
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
  62: 'BMG', // 电量表
  
  // 操控系统
  71: 'THR', // 油门转把
  72: 'BRH', // 刹车手柄
  
  // 实用配件
  81: 'RAC', // 货架尾箱
  82: 'PHN', // 手机支架
  83: 'ANT', // 防盗器
};

async function addDisplayId() {
  try {
    const SQL = await initSqlJs();
    
    // 读取数据库
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);
    
    console.log('=== 开始添加 display_id 字段 ===');
    
    // 1. 检查是否已经有 display_id 字段
    const tableInfo = db.exec("PRAGMA table_info(products)");
    const hasDisplayId = tableInfo[0].values.some(col => col[1] === 'display_id');
    
    if (!hasDisplayId) {
      console.log('📝 添加 display_id 字段...');
      db.run('ALTER TABLE products ADD COLUMN display_id TEXT');
    } else {
      console.log('✅ display_id 字段已存在');
    }
    
    // 2. 获取所有商品
    const products = db.exec('SELECT * FROM products ORDER BY id');
    if (!products || products.length === 0) {
      console.log('❌ 没有找到商品');
      return;
    }
    
    const productList = products[0].values;
    const columns = products[0].columns;
    
    console.log(`📦 找到 ${productList.length} 个商品`);
    
    // 3. 按分类统计并生成 display_id
    const categoryCounters = {};
    const updates = [];
    
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
      
      // 生成 display_id
      const displayId = `${categoryCode}-${String(categoryCounters[categoryCode]).padStart(3, '0')}`;
      
      updates.push({
        id: product.id,
        displayId: displayId
      });
      
      console.log(`  ${product.id} → ${displayId} | ${product.name}`);
    });
    
    // 4. 更新商品的 display_id
    console.log('💾 更新商品数据...');
    updates.forEach(({ id, displayId }) => {
      db.run('UPDATE products SET display_id = ? WHERE id = ?', [displayId, id]);
    });
    
    // 5. 保存数据库
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    
    console.log('✅ display_id 添加成功！');
    
    db.close();
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

addDisplayId();
