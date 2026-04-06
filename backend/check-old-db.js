
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function checkOldDB() {
  const SQL = await initSqlJs();
  
  // 读取旧数据库
  const oldDbPath = path.join(__dirname, 'quotation-backup-1775113344007.db');
  const fileBuffer = fs.readFileSync(oldDbPath);
  const db = new SQL.Database(fileBuffer);
  
  // 查看所有表
  console.log('=== 旧数据库表 ===');
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  if (tables &amp;&amp; tables.length &gt; 0) {
    tables[0].values.forEach(row =&gt; {
      console.log('-', row[0]);
      
      // 查看每个表的数据量
      const count = db.exec(`SELECT COUNT(*) FROM ${row[0]}`);
      if (count.length &gt; 0) {
        console.log('  数据量:', count[0].values[0][0]);
      }
      
      // 查看表结构
      const schema = db.exec(`PRAGMA table_info(${row[0]})`);
      if (schema.length &gt; 0) {
        console.log('  字段:');
        schema[0].values.forEach(col =&gt; {
          console.log('   ', col[1], '-', col[2]);
        });
      }
      console.log();
    });
  }
  
  // 查看一些关键数据
  console.log('\n=== 分类数据 ===');
  const categories = db.exec('SELECT * FROM categories LIMIT 5');
  if (categories.length &gt; 0) {
    console.log(JSON.stringify(categories[0].values, null, 2));
  }
  
  console.log('\n=== 商品数据 ===');
  const products = db.exec('SELECT * FROM products LIMIT 3');
  if (products.length &gt; 0) {
    console.log(JSON.stringify(products[0].values, null, 2));
  }
}

checkOldDB();
