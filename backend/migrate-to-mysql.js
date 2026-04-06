
const initSqlJs = require('sql.js');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// MySQL 配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '611',
  database: 'quotation_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function migrateData() {
  console.log('=== 开始数据迁移 ===');

  // 1. 读取 SQLite 数据库
  console.log('1. 读取 SQLite 数据库...');
  const SQL = await initSqlJs();
  const sqlitePath = path.join(__dirname, 'quotation.db');
  const fileBuffer = fs.readFileSync(sqlitePath);
  const sqliteDb = new SQL.Database(fileBuffer);

  // 2. 连接 MySQL 并创建数据库
  console.log('2. 连接 MySQL...');
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();

  // 3. 连接到目标数据库
  const pool = mysql.createPool(dbConfig);
  const conn = await pool.getConnection();

  try {
    // 禁用外键检查
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    // 4. 创建表
    console.log('3. 创建 MySQL 表...');
    await createMySQLTables(conn);

    // 5. 迁移数据
    console.log('4. 迁移数据...');

    // 迁移分类
    await migrateCategories(sqliteDb, conn);

    // 迁移商品
    await migrateProducts(sqliteDb, conn);

    // 迁移报价单
    await migrateQuotations(sqliteDb, conn);

    // 迁移报价单明细
    await migrateQuotationItems(sqliteDb, conn);

    // 迁移用户
    await migrateUsers(sqliteDb, conn);

    console.log('=== 数据迁移完成！ ===');
  } finally {
    // 重新启用外键检查
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    conn.release();
    await pool.end();
  }
}

async function createMySQLTables(conn) {
  // 分类表
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      parent_id INT,
      icon VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 商品表
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INT,
      image_url VARCHAR(500),
      stock_status VARCHAR(50) DEFAULT '有货',
      specs TEXT,
      model VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 报价单表
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS quotations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      quotation_no VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(20),
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      payment_terms VARCHAR(255) DEFAULT '银行转账，30 天账期',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 报价单明细表
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      quotation_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_specs TEXT,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      subtotal DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 用户表
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(255),
      identity VARCHAR(50) DEFAULT '车友',
      level INT DEFAULT 0,
      avatar TEXT,
      wechat VARCHAR(255),
      car_model VARCHAR(255),
      is_admin TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function migrateCategories(sqliteDb, conn) {
  const result = sqliteDb.exec('SELECT * FROM categories');
  if (!result || result.length === 0) {
    console.log('  - 没有分类数据');
    return;
  }

  const rows = result[0].values;
  console.log(`  - 迁移 ${rows.length} 条分类数据...`);

  for (const row of rows) {
    await conn.execute(
      'INSERT INTO categories (id, name, parent_id, icon, created_at) VALUES (?, ?, ?, ?, ?)',
      [row[0], row[1], row[2], row[3], row[4]]
    );
  }
  console.log('  ✓ 分类数据迁移完成');
}

async function migrateProducts(sqliteDb, conn) {
  const result = sqliteDb.exec('SELECT * FROM products');
  if (!result || result.length === 0) {
    console.log('  - 没有商品数据');
    return;
  }

  const rows = result[0].values;
  console.log(`  - 迁移 ${rows.length} 条商品数据...`);

  for (const row of rows) {
    await conn.execute(
      'INSERT INTO products (id, name, description, price, category_id, image_url, stock_status, specs, model, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]]
    );
  }
  console.log('  ✓ 商品数据迁移完成');
}

async function migrateQuotations(sqliteDb, conn) {
  const result = sqliteDb.exec('SELECT * FROM quotations');
  if (!result || result.length === 0) {
    console.log('  - 没有报价单数据');
    return;
  }

  const rows = result[0].values;
  console.log(`  - 迁移 ${rows.length} 条报价单数据...`);

  for (const row of rows) {
    await conn.execute(
      'INSERT INTO quotations (id, quotation_no, customer_name, customer_phone, total_amount, status, payment_terms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]]
    );
  }
  console.log('  ✓ 报价单数据迁移完成');
}

async function migrateQuotationItems(sqliteDb, conn) {
  const result = sqliteDb.exec('SELECT * FROM quotation_items');
  if (!result || result.length === 0) {
    console.log('  - 没有报价单明细数据');
    return;
  }

  const rows = result[0].values;
  console.log(`  - 迁移 ${rows.length} 条报价单明细数据...`);

  for (const row of rows) {
    await conn.execute(
      'INSERT INTO quotation_items (id, quotation_id, product_id, product_name, product_specs, unit_price, quantity, subtotal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]]
    );
  }
  console.log('  ✓ 报价单明细数据迁移完成');
}

async function migrateUsers(sqliteDb, conn) {
  const result = sqliteDb.exec('SELECT * FROM users');
  if (!result || result.length === 0) {
    console.log('  - 没有用户数据');
    return;
  }

  const rows = result[0].values;
  console.log(`  - 迁移 ${rows.length} 条用户数据...`);

  for (const row of rows) {
    await conn.execute(
      'INSERT INTO users (id, phone, password, nickname, identity, level, avatar, wechat, car_model, is_admin, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]]
    );
  }
  console.log('  ✓ 用户数据迁移完成');
}

migrateData().catch(console.error);
