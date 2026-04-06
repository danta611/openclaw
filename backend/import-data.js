const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quotation.db');

async function importData() {
  const SQL = await initSqlJs();
  
  // 读取现有数据库
  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);
  
  // 读取电动车配件数据
  const ebikeData = require('/root/.openclaw/workspace/ebike-parts.json');
  
  // 清空现有商品数据
  db.run('DELETE FROM products');
  
  // 插入新数据（适配现有表结构）
  ebikeData.forEach((item, index) => {
    const description = item.note || '';
    const specs = `型号：${item.model} | 库存：${item.stock} | 状态：${item.status}`;
    const imageUrl = '/images/default-product.png';
    
    db.run(
      'INSERT INTO products (name, description, price, category_id, image_url, stock_status, specs) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.name, description, item.price, 1, imageUrl, item.status, specs]
    );
  });
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log('✅ 成功导入', ebikeData.length, '条电动自行车配件数据');
  console.log('数据库已保存到:', DB_PATH);
}

importData().catch(console.error);
