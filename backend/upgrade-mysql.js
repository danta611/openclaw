
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '611',
  database: 'quotation_system'
};

async function upgradeDatabase() {
  console.log('🚀 开始升级 MySQL 数据库...');

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. 检查categories表是否有新字段
    const [cols1] = await connection.execute("SHOW COLUMNS FROM categories");
    const colNames1 = cols1.map(col => col.Field);

    if (!colNames1.includes('abbreviation')) {
      console.log('➕ 新增 categories.abbreviation 字段');
      await connection.execute("ALTER TABLE categories ADD COLUMN abbreviation VARCHAR(50)");
    }
    if (!colNames1.includes('sort_order')) {
      console.log('➕ 新增 categories.sort_order 字段');
      await connection.execute("ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0");
    }
    if (!colNames1.includes('level')) {
      console.log('➕ 新增 categories.level 字段');
      await connection.execute("ALTER TABLE categories ADD COLUMN level INT DEFAULT 0");
    }

    // 2. 检查products表是否有product_no字段
    const [cols2] = await connection.execute("SHOW COLUMNS FROM products");
    const colNames2 = cols2.map(col => col.Field);

    if (!colNames2.includes('product_no')) {
      console.log('➕ 新增 products.product_no 字段');
      await connection.execute("ALTER TABLE products ADD COLUMN product_no VARCHAR(50)");
    }

    // 3. 更新现有目录的sort_order和level
    console.log('🔄 更新现有目录数据...');

    const [categories] = await connection.execute("SELECT * FROM categories ORDER BY id");
    
    for (let index = 0; index < categories.length; index++) {
      const cat = categories[index];
      const level = cat.parent_id ? 1 : 0;

      await connection.execute(
        "UPDATE categories SET sort_order = ?, level = ? WHERE id = ?",
        [index + 1, level, cat.id]
      );
      console.log(`   目录 ${cat.name} → 排序: ${index + 1}, 层级: ${level}`);
    }

    console.log('✅ MySQL 数据库升级成功！');

  } catch (error) {
    console.error('❌ MySQL 数据库升级失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

upgradeDatabase().catch(console.error);

