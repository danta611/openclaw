const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/quotation.db');

async function checkDB() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);
    
    console.log('📊 检查数据库...');
    console.log('');
    
    // 查询报价单
    const quotations = db.exec('SELECT * FROM quotations');
    if (quotations.length > 0 && quotations[0].values.length > 0) {
      console.log('✅ 报价单:');
      console.table(quotations[0].values);
      console.log('');
      
      // 查询报价单明细
      const quotationItems = db.exec('SELECT * FROM quotation_items');
      if (quotationItems.length > 0 && quotationItems[0].values.length > 0) {
        console.log('✅ 报价单明细:');
        console.table(quotationItems[0].values);
      } else {
        console.log('❌ 没有报价单明细！');
      }
    } else {
      console.log('❌ 没有报价单数据');
    }
  } else {
    console.log('❌ 数据库文件不存在');
  }
}

checkDB().catch(console.error);
