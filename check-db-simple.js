
const fs = require('fs');
const path = require('path');
const Database = require('sql.js');

const DB_PATH = path.join(__dirname, 'backend', 'quotations.db');

async function checkDatabase() {
  try {
    // 读取数据库文件
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new Database(fileBuffer);
    
    console.log('=== 数据库检查 ===');
    
    // 查询所有报价单
    console.log('\n1️⃣ 所有报价单:');
    const quotations = db.exec('SELECT * FROM quotations');
    if (quotations.length > 0) {
      const columns = quotations[0].columns;
      const values = quotations[0].values;
      console.log('列:', columns);
      values.forEach((row, i) => {
        console.log(`订单 ${i + 1}:`, row);
      });
    }
    
    // 查询所有报价单明细
    console.log('\n2️⃣ 所有报价单明细:');
    const items = db.exec('SELECT * FROM quotation_items');
    if (items.length > 0) {
      const columns = items[0].columns;
      const values = items[0].values;
      console.log('列:', columns);
      values.forEach((row, i) => {
        console.log(`明细 ${i + 1}:`, row);
      });
    } else {
      console.log('❌ 没有任何明细数据！');
    }
    
    db.close();
  } catch (error) {
    console.error('错误:', error);
  }
}

checkDatabase();
