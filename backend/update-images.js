
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

console.log('🚀 开始更新商品图片...');

const DB_PATH = path.join(__dirname, 'quotation.db');

// 示例商品图片（来自免费图床或真实商品图）
const productImages = {
  1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', // 电机
  2: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop', // 中置电机
  4: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop', // 锂电池
  7: 'https://images.unsplash.com/photo-1502877338535-766dec3f08c2?w=400&h=400&fit=crop', // 碟刹
  11: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop', // 大灯
  15: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d93?w=400&h=400&fit=crop', // 车把
  20: 'https://images.unsplash.com/photo-1571068316344-75bc76f77880?w=400&h=400&fit=crop', // 前叉
  23: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0b?w=400&h=400&fit=crop', // 仪表
  27: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'  // 轮胎
};

async function updateImages() {
  const SQL = await initSqlJs();
  
  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    console.error('❌ 数据库文件不存在！');
    process.exit(1);
  }
  
  // 备份
  const backupPath = path.join(__dirname, `quotation-backup-${Date.now()}.db`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`💾 已备份数据库到: ${backupPath}`);
  
  // 更新图片
  let count = 0;
  Object.entries(productImages).forEach(([id, url]) => {
    db.run('UPDATE products SET image_url = ? WHERE id = ?', [url, id]);
    count++;
    console.log(`✅ 更新商品 ${id}: ${url}`);
  });
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log(`\n🎉 成功更新 ${count} 个商品图片！`);
  console.log('🌐 请刷新页面查看效果');
}

updateImages().catch(console.error);
