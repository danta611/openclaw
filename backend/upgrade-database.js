
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quotation.db');

let db = null;

// 拼音首字母映射（常用词）
const pinyinMap = {
  '动': 'D', '力': 'L', '系': 'X', '统': 'T',
  '制': 'Z', '动': 'D', '灯': 'D', '光': 'G',
  '照': 'Z', '明': 'M', '轮': 'L', '胎': 'T',
  '毂': 'G', '减': 'J', '震': 'Z', '仪': 'Y',
  '表': 'B', '盘': 'P', '操': 'C', '控': 'K',
  '实': 'S', '用': 'Y', '配': 'P', '件': 'J',
  '电': 'D', '机': 'J', '控': 'K', '制': 'Z',
  '器': 'Q', '池': 'C', '充': 'C', '碟': 'D',
  '刹': 'S', '车': 'C', '片': 'P', '油': 'Y',
  '大': 'D', '转': 'Z', '向': 'X', '氛': 'F',
  '围': 'W', '前': 'Q', '叉': 'C', '后': 'H',
  '液': 'Y', '晶': 'J', '量': 'L', '门': 'M',
  '油': 'Y', '把': 'B', '手': 'S', '柄': 'B',
  '货': 'H', '架': 'J', '尾': 'W', '箱': 'X',
  '机': 'J', '支': 'Z', '架': 'J', '防': 'F',
  '盗': 'D', '器': 'Q'
};

// 获取汉字首字母
function getPinyinInitial(char) {
  if (pinyinMap[char]) return pinyinMap[char];
  return char.toUpperCase();
}

// 生成目录缩写
function generateAbbreviation(name) {
  let abbr = '';
  for (let i = 0; i < name.length && abbr.length < 8; i++) {
    const char = name[i];
    if (/[\u4e00-\u9fa5]/.test(char)) {
      abbr += getPinyinInitial(char);
    } else if (/[a-zA-Z0-9]/.test(char)) {
      abbr += char.toUpperCase();
    }
  }
  return abbr || 'CATE';
}

async function upgradeDatabase() {
  const SQL = await initSqlJs();
  
  // 加载数据库
  const fileBuffer = fs.readFileSync(DB_PATH);
  db = new SQL.Database(fileBuffer);
  
  console.log('🚀 开始升级数据库...');

  try {
    // 1. 检查categories表是否有abbreviation字段
    const cols1 = db.exec("PRAGMA table_info(categories)");
    const hasAbbreviation = cols1[0].values.some(col => col[1] === 'abbreviation');
    const hasSortOrder = cols1[0].values.some(col => col[1] === 'sort_order');
    const hasLevel = cols1[0].values.some(col => col[1] === 'level');

    if (!hasAbbreviation) {
      console.log('➕ 新增 categories.abbreviation 字段');
      db.run("ALTER TABLE categories ADD COLUMN abbreviation TEXT");
    }
    if (!hasSortOrder) {
      console.log('➕ 新增 categories.sort_order 字段');
      db.run("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0");
    }
    if (!hasLevel) {
      console.log('➕ 新增 categories.level 字段');
      db.run("ALTER TABLE categories ADD COLUMN level INTEGER DEFAULT 0");
    }

    // 2. 检查products表是否有product_no字段
    const cols2 = db.exec("PRAGMA table_info(products)");
    const hasProductNo = cols2[0].values.some(col => col[1] === 'product_no');

    if (!hasProductNo) {
      console.log('➕ 新增 products.product_no 字段');
      db.run("ALTER TABLE products ADD COLUMN product_no TEXT");
    }

    // 3. 为现有目录生成缩写和设置sort_order、level
    console.log('🔄 更新现有目录数据...');
    
    const categories = db.exec("SELECT * FROM categories ORDER BY id, parent_id")[0];
    if (categories && categories.values) {
      categories.values.forEach((row, index) => {
        const id = row[0];
        const name = row[1];
        const parentId = row[2];
        
        const abbreviation = generateAbbreviation(name);
        const level = parentId ? 1 : 0;
        
        db.run(
          "UPDATE categories SET abbreviation = ?, sort_order = ?, level = ? WHERE id = ?",
          [abbreviation, index + 1, level, id]
        );
        console.log(`   目录 ${name} → 缩写: ${abbreviation}, 排序: ${index + 1}, 层级: ${level}`);
      });
    }

    // 保存数据库
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);

    console.log('✅ 数据库升级成功！');
    
  } catch (error) {
    console.error('❌ 数据库升级失败:', error);
    throw error;
  }
}

upgradeDatabase().catch(console.error);

