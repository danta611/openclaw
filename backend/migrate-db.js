
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function migrateDB() {
  const SQL = await initSqlJs();
  
  // 读取当前数据库
  const dbPath = path.join(__dirname, 'quotation.db');
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  console.log('=== 检查当前数据库表 ===');
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  if (tables &amp;&amp; tables.length &gt; 0) {
    tables[0].values.forEach(row =&gt; {
      console.log('-', row[0]);
    });
  }
  
  // 检查 users 表是否存在
  const usersTableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  if (!usersTableCheck || usersTableCheck.length === 0 || usersTableCheck[0].values.length === 0) {
    console.log('\n=== 创建 users 表 ===');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nickname TEXT,
        identity TEXT DEFAULT '车友',
        level INTEGER DEFAULT 0,
        avatar TEXT,
        wechat TEXT,
        car_model TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ users 表创建成功');
  } else {
    console.log('\n✓ users 表已存在');
  }
  
  // 初始化三个账号
  console.log('\n=== 初始化用户数据 ===');
  
  const users = [
    { phone: '18218361198', password: '699', level: 2, is_admin: 0 },
    { phone: '15889339863', password: '699', level: 4, is_admin: 1 },
    { phone: '18124666369', password: '699', level: 5, is_admin: 1 }
  ];
  
  users.forEach(user =&gt; {
    // 检查用户是否已存在
    const existing = db.exec(`SELECT id FROM users WHERE phone = '${user.phone}'`);
    if (!existing || existing.length === 0 || existing[0].values.length === 0) {
      db.run(
        `INSERT INTO users (phone, password, level, is_admin) VALUES (?, ?, ?, ?)`,
        [user.phone, user.password, user.level, user.is_admin]
      );
      console.log(`✓ 添加用户: ${user.phone} (level: ${user.level})`);
    } else {
      console.log(`- 用户已存在: ${user.phone}`);
    }
  });
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
  
  console.log('\n✓ 数据库迁移完成！');
  
  // 验证一下
  console.log('\n=== 验证用户数据 ===');
  const allUsers = db.exec('SELECT * FROM users');
  if (allUsers &amp;&amp; allUsers.length &gt; 0) {
    allUsers[0].values.forEach(row =&gt; {
      console.log(`- ${row[1]} (level: ${row[5]}, admin: ${row[9]})`);
    });
  }
}

migrateDB();
