
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function checkData() {
  const SQL = await initSqlJs();
  
  // 读取当前数据库
  const dbPath = path.join(__dirname, 'quotation.db');
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  // 查看所有表
  console.log('=== 数据库表 ===');
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  if (tables &amp;&amp; tables.length &gt; 0) {
    tables[0].values.forEach(row =&gt; {
      console.log('-', row[0]);
      const count = db.exec(`SELECT COUNT(*) FROM ${row[0]}`);
      if (count &amp;&amp; count.length &gt; 0) {
        console.log('  数据量:', count[0].values[0][0]);
      }
    });
  }
  
  // 查看分类
  console.log('\n=== 分类数据 ===');
  const categories = db.exec('SELECT * FROM categories LIMIT 10');
  if (categories &amp;&amp; categories.length &gt; 0) {
    console.log('字段:', categories[0].columns);
    console.log('前10条:', categories[0].values);
  } else {
    console.log('没有分类数据');
  }
  
  // 查看商品
  console.log('\n=== 商品数据 ===');
  const products = db.exec('SELECT * FROM products LIMIT 5');
  if (products &amp;&amp; products.length &gt; 0) {
    console.log('字段:', products[0].columns);
    console.log('前5条:', products[0].values);
  } else {
    console.log('没有商品数据');
  }
}

checkData();
