
const mysql = require('mysql2/promise');
const { pinyin } = require('pinyin-pro');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '611',
  database: 'quotation_system'
};

function generateAbbreviation(name) {
  let abbr = '';
  for (let i = 0; i < name.length && abbr.length < 8; i++) {
    const char = name[i];
    if (/[\u4e00-\u9fa5]/.test(char)) {
      // 使用 pinyin-pro 获取拼音首字母
      const py = pinyin(char, { toneType: 'none' });
      if (py && py.length > 0) {
        abbr += py[0].toUpperCase();
      }
    } else if (/[a-zA-Z0-9]/.test(char)) {
      abbr += char.toUpperCase();
    }
  }
  return abbr || 'CATE';
}

async function updateAbbreviations() {
  console.log('🚀 开始更新目录缩写...');

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY id');
    
    for (const cat of categories) {
      const abbreviation = generateAbbreviation(cat.name);
      console.log(`   ${cat.name} → ${abbreviation}`);
      
      await connection.execute(
        'UPDATE categories SET abbreviation = ? WHERE id = ?',
        [abbreviation, cat.id]
      );
    }

    console.log('✅ 目录缩写更新成功！');
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updateAbbreviations().catch(console.error);

