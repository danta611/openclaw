const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/quotation.db');

async function updateDescriptions() {
  const SQL = await initSqlJs();
  
  // 加载数据库
  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);
  
  // 更新几个商品的描述，添加较长的介绍信息
  const updates = [
    {
      id: 1,
      description: '高性能无刷电机，采用最新的磁钢材料，提供强劲动力输出。适用于各类电动自行车改装，额定功率1500W，峰值功率可达2500W。具备IPX7级防水性能，即使在雨天也能正常使用。内置温度保护系统，有效防止过热损坏，延长使用寿命。'
    },
    {
      id: 2,
      description: '智能正弦波控制器，采用先进的FOC矢量控制算法，提供平滑的加速体验。支持多种骑行模式切换，包括节能模式、普通模式和运动模式。具备过流、过压、欠压等多重保护功能，确保骑行安全。兼容48V-72V电池系统，适配性广泛。'
    },
    {
      id: 3,
      description: '大容量锂电池组，采用汽车级动力电芯，容量高达60V30Ah。支持快速充电，2小时即可充满80%电量。内置BMS电池管理系统，实时监控每节电芯的状态，确保充放电安全。循环寿命可达1000次以上，性价比极高。'
    },
    {
      id: 4,
      description: '智能快充充电器，支持60V电池系统，最大充电电流8A。采用高频开关电源技术，转换效率高达92%以上。具备过充、过流、短路等多重保护，同时支持电池温度监测。机身采用铝合金材质，散热性能优异，适合长时间充电使用。'
    },
    {
      id: 5,
      description: '前后双活塞碟刹套装，采用大尺寸刹车盘，提供强劲的制动效果。刹车片采用陶瓷复合材料，耐磨性能优异，使用寿命可达3万公里。刹车手感线性细腻，即使在高速行驶时也能提供稳定的制动力。适合各类电动自行车和电摩改装使用。'
    }
  ];
  
  updates.forEach(item => {
    db.run(
      'UPDATE products SET description = ? WHERE id = ?',
      [item.description, item.id]
    );
    console.log(`✅ 更新商品 ${item.id} 的描述成功`);
  });
  
  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  
  console.log('\n✨ 所有商品描述更新完成！');
}

updateDescriptions().catch(console.error);
