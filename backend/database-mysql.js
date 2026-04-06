const mysql = require('mysql2/promise');

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

let pool = null;

// 初始化数据库连接池
async function initDatabase() {
  try {
    // 先连接到 MySQL server（不指定数据库）
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();

    // 现在连接到指定数据库
    pool = mysql.createPool(dbConfig);

    // 创建表
    await createTables();

    console.log('✅ MySQL 数据库初始化完成');
    return pool;
  } catch (error) {
    console.error('❌ MySQL 数据库初始化失败:', error);
    throw error;
  }
}

// 创建表
async function createTables() {
  const connection = await pool.getConnection();

  try {
    // 分类表
    await connection.execute(`
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
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INT,
        image_url TEXT,
        stock_status VARCHAR(50) DEFAULT '有货',
        specs TEXT,
        model VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 报价单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quotation_no VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        payment_terms VARCHAR(255) DEFAULT '银行转账，30 天账期',
        inquiry_status ENUM('询价中', '已答复') DEFAULT '询价中',
        original_total DECIMAL(10,2),
        discount_amount DECIMAL(10,2),
        final_total DECIMAL(10,2),
        user_viewed_at DATETIME,
        admin_viewed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 报价单明细表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quotation_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_specs TEXT,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        subtotal DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        modified_price DECIMAL(10,2),
        original_subtotal DECIMAL(10,2),
        modified_subtotal DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quotation_id) REFERENCES quotations(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(255),
        identity VARCHAR(50) DEFAULT '车友',
        level INT DEFAULT 1,
        avatar TEXT,
        wechat VARCHAR(255),
        car_model VARCHAR(255),
        is_admin TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 店铺信息表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shop_info (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        description TEXT,
        phone VARCHAR(20),
        hours VARCHAR(255),
        address TEXT,
        wechat VARCHAR(255),
        logo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ 所有表创建成功');
  } finally {
    connection.release();
  }
}

// 查询函数
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// 执行函数（返回最后插入的ID）
async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

// 兼容函数（MySQL 不需要手动保存）
function saveDatabase() {
  // MySQL 自动保存，不需要做任何事
  return;
}

module.exports = {
  initDatabase,
  query,
  execute,
  saveDatabase,
  pool
};
