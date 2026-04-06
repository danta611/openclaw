
// 分类编码映射
export const CATEGORY_CODES = {
  // 动力系统
  11: 'MOT', // 电机
  12: 'ECU', // 控制器
  13: 'BAT', // 电池
  14: 'CHG', // 充电器
  
  // 制动系统
  21: 'BRK', // 碟刹
  22: 'PAD', // 刹车片
  23: 'FLD', // 刹车油
  
  // 灯光照明
  31: 'LGT', // 大灯
  32: 'TUR', // 转向灯
  33: 'ATM', // 氛围灯
  
  // 轮胎轮毂
  41: 'TIR', // 轮胎
  42: 'WHL', // 轮毂
  
  // 减震系统
  51: 'FRK', // 前叉减震
  52: 'REK', // 后减震
  
  // 仪表盘
  61: 'LCD', // 液晶屏
  62: 'BMG', // 电量表
  
  // 操控系统
  71: 'THR', // 油门转把
  72: 'BRH', // 刹车手柄
  
  // 实用配件
  81: 'RAC', // 货架尾箱
  82: 'PHN', // 手机支架
  83: 'ANT', // 防盗器
};

// 数字ID到显示ID的映射表（手动维护，方便后期修改）
export const PRODUCT_ID_MAP = {
  // 电机 (MOT)
  1: 'MOT-001',
  2: 'MOT-002',
  6: 'MOT-003',
  
  // 控制器 (ECU)
  3: 'ECU-001',
  
  // 电池 (BAT)
  4: 'BAT-001',
  5: 'BAT-002',
  
  // 碟刹 (BRK)
  7: 'BRK-001',
  8: 'BRK-002',
  
  // 实用配件 (PRD - 货架尾箱等)
  18: 'ACC-001',
};

// 生成显示ID的函数
export function formatProductId(product) {
  if (!product) return '';
  
  // 优先使用映射表
  if (PRODUCT_ID_MAP[product.id]) {
    return PRODUCT_ID_MAP[product.id];
  }
  
  // 如果没有映射，使用默认规则
  const categoryId = product.category_id;
  const categoryCode = CATEGORY_CODES[categoryId] || 'PRD';
  return `${categoryCode}-${String(product.id).padStart(3, '0')}`;
}
