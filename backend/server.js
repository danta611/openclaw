
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('./database-mysql');

const app = express();
const PORT = process.env.PORT || 5002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ============ API 路由 ============

// 初始化用户数据（临时接口）
app.get('/api/init-users', async (req, res) => {
  try {
    // 检查是否已有用户数据
    const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      return res.json({ success: true, message: '用户数据已存在' });
    }
    
    // 初始化三个账号
    const users = [
      { phone: '18218361198', password: '699', level: 2, is_admin: 0 },
      { phone: '15889339863', password: '699', level: 4, is_admin: 1 },
      { phone: '18124666369', password: '699', level: 5, is_admin: 1 }
    ];
    
    for (const user of users) {
      await db.execute(
        'INSERT INTO users (phone, password, level, is_admin) VALUES (?, ?, ?, ?)',
        [user.phone, user.password, user.level, user.is_admin]
      );
    }
    
    res.json({ success: true, message: '用户数据初始化成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 店铺信息 API ============

// 获取店铺信息
app.get('/api/shop-info', async (req, res) => {
  try {
    const shopInfos = await db.query('SELECT * FROM shop_info ORDER BY id DESC LIMIT 1');
    const shopInfo = shopInfos[0];
    if (!shopInfo) {
      // 如果没有店铺信息，返回默认值
      return res.json({ 
        success: true, 
        data: {
          name: '车酷正品配件',
          description: '配件批发零售。配备专业师傅，承接车辆美容，方案设计，个性组配，维修保养。',
          phone: '15889339863',
          hours: '9:00-21:00',
          wechat: 'AYW6998',
          logo: null
        }
      });
    }
    res.json({ success: true, data: shopInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新店铺信息
app.put('/api/shop-info', async (req, res) => {
  try {
    const { name, description, phone, hours, wechat, logo } = req.body;
    
    // 先检查是否有店铺信息
    const existingInfos = await db.query('SELECT * FROM shop_info ORDER BY id DESC LIMIT 1');
    
    if (existingInfos.length > 0) {
      // 更新现有店铺信息
      await db.execute(
        `UPDATE shop_info SET name = ?, description = ?, phone = ?, hours = ?, wechat = ?, logo = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name || null, description || null, phone || null, hours || null, wechat || null, logo || null, existingInfos[0].id]
      );
    } else {
      // 创建新的店铺信息
      await db.execute(
        `INSERT INTO shop_info (name, description, phone, hours, wechat, logo) VALUES (?, ?, ?, ?, ?, ?)`,
        [name || null, description || null, phone || null, hours || null, wechat || null, logo || null]
      );
    }
    
    // 返回最新的店铺信息
    const shopInfos = await db.query('SELECT * FROM shop_info ORDER BY id DESC LIMIT 1');
    res.json({ success: true, data: shopInfos[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 用户管理 API ============

// 获取用户列表（管理员用）
app.get('/api/users/manage', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个用户详情（管理员用）
app.get('/api/users/manage/:id', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新用户信息（管理员用）
app.put('/api/users/manage/:id', async (req, res) => {
  try {
    const { nickname, identity, wechat, car_model, level, is_admin, password } = req.body;
    
    // 检查用户是否存在
    const existingUsers = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!existingUsers.length) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    const existingUser = existingUsers[0];
    
    // 构建更新语句
    const updates = [];
    const params = [];
    
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname || null);
    }
    if (identity !== undefined) {
      updates.push('identity = ?');
      params.push(identity || '车友');
    }
    if (wechat !== undefined) {
      updates.push('wechat = ?');
      params.push(wechat || null);
    }
    if (car_model !== undefined) {
      updates.push('car_model = ?');
      params.push(car_model || null);
    }
    if (level !== undefined) {
      updates.push('level = ?');
      params.push(level !== null ? parseInt(level) : 1);
    }
    if (is_admin !== undefined) {
      updates.push('is_admin = ?');
      params.push(is_admin ? 1 : 0);
    }
    if (password !== undefined && password) {
      updates.push('password = ?');
      params.push(password);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(req.params.id);
      
      await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
    
    // 返回更新后的用户信息
    const updatedUsers = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedUsers[0] });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户的询价单列表
app.get('/api/users/manage/:id/quotations', async (req, res) => {
  try {
    // 先获取用户信息
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!users.length) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    // 根据手机号查询该用户的询价单
    const quotations = await db.query(
      'SELECT * FROM quotations WHERE customer_phone = ? ORDER BY created_at DESC',
      [users[0].phone]
    );
    
    res.json({ success: true, data: quotations });
  } catch (error) {
    console.error('获取用户询价单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除用户
app.delete('/api/users/manage/:id', async (req, res) => {
  try {
    // 检查用户是否存在
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!users.length) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    // 删除用户
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 用户 API ============

// 获取用户信息
app.get('/api/users/:phone', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [req.params.phone]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新用户信息
app.put('/api/users/:phone', async (req, res) => {
  try {
    const { nickname, identity, avatar, wechat, car_model, level } = req.body;
    
    // 只在传递了level的时候才更新，否则保持原样
    if (level !== undefined) {
      await db.execute(
        `UPDATE users SET nickname = ?, identity = ?, avatar = ?, wechat = ?, car_model = ?, level = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE phone = ?`,
        [nickname || null, identity || '车友', avatar || null, wechat || null, car_model || null, level, req.params.phone]
      );
    } else {
      await db.execute(
        `UPDATE users SET nickname = ?, identity = ?, avatar = ?, wechat = ?, car_model = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE phone = ?`,
        [nickname || null, identity || '车友', avatar || null, wechat || null, car_model || null, req.params.phone]
      );
    }
    
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [req.params.phone]);
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const users = await db.query('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ success: false, error: '手机号或密码错误' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 注册用户
app.post('/api/register', async (req, res) => {
  try {
    const { phone, password, age, parentContact } = req.body;
    
    // 检查手机号是否已注册
    const existingUsers = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, error: '该手机号已注册，请直接登录' });
    }
    
    // 创建新用户（默认等级L1）
    await db.execute(
      'INSERT INTO users (phone, password, level, identity) VALUES (?, ?, 1, ?)',
      [phone, password, '车友']
    );
    
    // 获取新创建的用户
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 临时接口：随机分配商品标签（用于测试）
app.get('/api/randomize-stock-status', async (req, res) => {
  try {
    const statuses = ['现货', '预定', '缺货', '上新'];
    const products = await db.query('SELECT id FROM products');
    
    for (const product of products) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      await db.execute(
        'UPDATE products SET stock_status = ? WHERE id = ?',
        [randomStatus, product.id]
      );
    }
    
    res.json({ success: true, message: '商品标签随机分配成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 临时接口：更新商品描述（用于测试）
app.get('/api/update-test-descriptions', async (req, res) => {
  try {
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
    
    for (const item of updates) {
      await db.execute(
        'UPDATE products SET description = ? WHERE id = ?',
        [item.description, item.id]
      );
    }
    
    res.json({ success: true, message: '商品描述更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 目录管理 API ============

// 拼音首字母映射（常用词）
const pinyinMap = {
  '动': 'D', '力': 'L', '系': 'X', '统': 'T',
  '制': 'Z', '灯': 'D', '光': 'G',
  '照': 'Z', '明': 'M', '轮': 'L', '胎': 'T',
  '毂': 'G', '减': 'J', '震': 'Z', '仪': 'Y',
  '表': 'B', '盘': 'P', '操': 'C', '控': 'K',
  '实': 'S', '用': 'Y', '配': 'P', '件': 'J',
  '电': 'D', '机': 'J', '器': 'Q', '池': 'C',
  '充': 'C', '碟': 'D', '刹': 'S', '车': 'C',
  '片': 'P', '油': 'Y', '大': 'D', '转': 'Z',
  '向': 'X', '氛': 'F', '围': 'W', '前': 'Q',
  '叉': 'C', '后': 'H', '液': 'Y', '晶': 'J',
  '量': 'L', '门': 'M', '把': 'B', '手': 'S',
  '柄': 'B', '货': 'H', '架': 'J', '尾': 'W',
  '箱': 'X', '支': 'Z', '防': 'F', '盗': 'D'
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

// 获取所有分类（树形结构）
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order, id");
    const subCategories = await db.query("SELECT * FROM categories WHERE parent_id IS NOT NULL ORDER BY sort_order, id");
    
    const tree = categories.map(cat => ({
      ...cat,
      children: subCategories.filter(sub => sub.parent_id === cat.id)
    }));
    
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增目录
app.post('/api/categories', async (req, res) => {
  try {
    let { name, abbreviation, parent_id } = req.body;
    
    // 缩写强制转大写
    if (abbreviation) {
      abbreviation = abbreviation.toUpperCase();
    }
    
    // 检查缩写是否重复
    if (abbreviation) {
      const existing = await db.query(
        "SELECT id FROM categories WHERE abbreviation = ?",
        [abbreviation]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: '缩写已存在' });
      }
    }

    // 获取最大sort_order
    const maxResult = await db.query(
      "SELECT MAX(sort_order) as max FROM categories"
    );
    const sortOrder = (maxResult[0].max || 0) + 1;
    
    // 计算层级
    const level = parent_id ? 1 : 0;

    // 生成缩写（如果没提供）
    const abbr = abbreviation || generateAbbreviation(name);

    const categoryId = await db.execute(
      "INSERT INTO categories (name, abbreviation, parent_id, sort_order, level) VALUES (?, ?, ?, ?, ?)",
      [name, abbr, parent_id || null, sortOrder, level]
    );
    
    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    res.json({ success: true, data: categories[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新目录
app.put('/api/categories/:id', async (req, res) => {
  try {
    let { name, abbreviation, parent_id } = req.body;
    const categoryId = req.params.id;
    
    // 缩写强制转大写
    if (abbreviation) {
      abbreviation = abbreviation.toUpperCase();
    }
    
    // 检查缩写是否重复（排除自己）
    if (abbreviation) {
      const existing = await db.query(
        "SELECT id FROM categories WHERE abbreviation = ? AND id != ?",
        [abbreviation, categoryId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: '缩写已存在' });
      }
    }

    // 计算层级
    const level = parent_id ? 1 : 0;

    await db.execute(
      "UPDATE categories SET name = ?, abbreviation = ?, parent_id = ?, level = ? WHERE id = ?",
      [name, abbreviation, parent_id || null, level, categoryId]
    );
    
    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    res.json({ success: true, data: categories[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除目录
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // 查找所有子目录（递归）
    const allCategoryIds = [parseInt(categoryId)];
    const findChildren = async (parentId) => {
      const children = await db.query(
        "SELECT id FROM categories WHERE parent_id = ?",
        [parentId]
      );
      for (const child of children) {
        allCategoryIds.push(child.id);
        await findChildren(child.id);
      }
    };
    await findChildren(categoryId);
    
    // 构建IN子句的占位符
    const placeholders = allCategoryIds.map(() => '?').join(',');
    
    // 先删除子目录的parent_id外键关联（把子目录变成顶级目录）
    await db.execute(
      `UPDATE categories SET parent_id = NULL WHERE parent_id IN (${placeholders})`,
      allCategoryIds
    );
    
    // 再将所有相关商品的category_id设为NULL（变成未分配）
    await db.execute(
      `UPDATE products SET category_id = NULL WHERE category_id IN (${placeholders})`,
      allCategoryIds
    );
    
    // 最后删除所有目录
    await db.execute(
      `DELETE FROM categories WHERE id IN (${placeholders})`,
      allCategoryIds
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除目录失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 移动目录（调整顺序）
app.put('/api/categories/:id/move', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { direction } = req.body;
    
    // 获取当前目录信息
    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    const currentCat = categories[0];
    if (!currentCat) {
      return res.status(404).json({ success: false, error: '目录不存在' });
    }
    
    // 获取同层级的所有目录
    let siblings;
    if (currentCat.parent_id) {
      siblings = await db.query(
        "SELECT * FROM categories WHERE parent_id = ? ORDER BY sort_order, id",
        [currentCat.parent_id]
      );
    } else {
      siblings = await db.query(
        "SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order, id"
      );
    }
    
    // 找到当前目录在列表中的位置
    const currentIndex = siblings.findIndex(c => c.id === currentCat.id);
    
    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        return res.json({ success: true }); // 已经是第一个，不做操作
      }
    } else if (direction === 'down') {
      newIndex = currentIndex + 1;
      if (newIndex >= siblings.length) {
        return res.json({ success: true }); // 已经是最后一个，不做操作
      }
    } else {
      return res.status(400).json({ success: false, error: '无效的移动方向' });
    }
    
    // 交换sort_order
    const targetCat = siblings[newIndex];
    const tempSortOrder = currentCat.sort_order;
    
    await db.execute(
      "UPDATE categories SET sort_order = ? WHERE id = ?",
      [targetCat.sort_order, currentCat.id]
    );
    await db.execute(
      "UPDATE categories SET sort_order = ? WHERE id = ?",
      [tempSortOrder, targetCat.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取未分配目录的商品（放在最前面，避免和 /api/products/:id 冲突）
app.get('/api/unassigned-products', async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM products WHERE category_id IS NULL ORDER BY id"
    );
    // 即使没有商品也返回成功，data为空数组
    res.json({ success: true, data: products || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取商品列表
app.get('/api/products', async (req, res) => {
  try {
    const { category_id, search } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    
    if (category_id) {
      sql += ' AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))';
      params.push(category_id, category_id);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const products = await db.query(sql, params);
    // 解析多图URL并尝试从 specs 解析 model（兼容旧数据）
    products.forEach(p => {
      // 解析多图
      if (p.image_url) {
        try {
          p.images = JSON.parse(p.image_url);
        } catch (e) {
          p.images = p.image_url ? [p.image_url] : [];
        }
      } else {
        p.images = [];
      }
      // 兼容旧数据
      if (!p.model && p.specs) {
        const modelMatch = p.specs.match(/型号[：:]\s*([^|]+)/);
        if (modelMatch) {
          p.model = modelMatch[1].trim();
        }
      }
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成 display_id（辅助函数）
function generateDisplayId(product) {
  if (!product) return '';
  const categoryCode = (product.category_id || 0).toString().padStart(2, '0');
  const productCode = (product.id || 0).toString().padStart(4, '0');
  return `CP${categoryCode}-${productCode}`;
}

// 获取商品详情
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const product = products[0];
    if (!product) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    // 解析多图URL
    if (product.image_url) {
      try {
        product.images = JSON.parse(product.image_url);
      } catch (e) {
        product.images = product.image_url ? [product.image_url] : [];
      }
    } else {
      product.images = [];
    }
    // 尝试从 specs 解析 model（兼容旧数据）
    if (!product.model && product.specs) {
      const modelMatch = product.specs.match(/型号[：:]\s*([^|]+)/);
      if (modelMatch) {
        product.model = modelMatch[1].trim();
      }
    }
    // 生成 display_id
    product.display_id = generateDisplayId(product);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建报价单
app.post('/api/quotations', async (req, res) => {
  try {
    const { customer_name, customer_phone, items } = req.body;
    
    console.log('📝 创建报价单，items:', items);
    
    // 生成报价单号
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const quotation_no = `QT-${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // 计算总价
    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    console.log('💾 插入报价单...');
    // 插入报价单
    const quotation_id = await db.execute(`
      INSERT INTO quotations (quotation_no, customer_name, customer_phone, total_amount)
      VALUES (?, ?, ?, ?)
    `, [quotation_no, customer_name || null, customer_phone || null, total_amount]);
    
    console.log('✅ 报价单ID:', quotation_id);
    
    // 插入报价单明细
    console.log('💾 插入报价单明细...');
    for (const item of items) {
      const products = await db.query('SELECT * FROM products WHERE id = ?', [item.product_id]);
      const product = products[0];
      console.log('   - 商品:', product.name, '数量:', item.quantity);
      await db.execute(`
        INSERT INTO quotation_items (quotation_id, product_id, product_name, product_specs, unit_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        quotation_id, 
        item.product_id, 
        product.name, 
        product.model || '', 
        item.unit_price || product.price, 
        item.quantity,
        (item.unit_price || product.price) * item.quantity
      ]);
    }
    
    // 获取完整的报价单数据
    const quotations = await db.query('SELECT * FROM quotations WHERE id = ?', [quotation_id]);
    const quotationItems = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotation_id]);
    console.log('✅ 查询到明细数量:', quotationItems.length);
    
    res.json({ 
      success: true, 
      data: { ...quotations[0], items: quotationItems }
    });
  } catch (error) {
    console.error('❌ 创建报价单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 询单提醒 API ============

// 获取管理员未回复的询单数（简化版：只要是询价中就显示）
app.get('/api/quotations/unreplied-count', async (req, res) => {
  try {
    // 查询：所有询价中的询单数量
    const count = await db.query(`
      SELECT COUNT(*) as count FROM quotations 
      WHERE inquiry_status = '询价中'
    `);
    
    res.json({ success: true, count: count[0].count || 0 });
  } catch (error) {
    console.error('获取未回复询单数失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取报价单详情
app.get('/api/quotations/:id', async (req, res) => {
  try {
    const quotations = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    const quotation = quotations[0];
    if (!quotation) {
      return res.status(404).json({ success: false, error: '报价单不存在' });
    }
    
    const items = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      data: { ...quotation, items }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 询单提醒 API ============

// 获取用户未读回复的询单数
app.get('/api/quotations/unread-count', async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) {
      return res.json({ success: true, count: 0 });
    }
    
    // 查询：已答复且用户未查看（或最后查看时间早于更新时间）
    const count = await db.query(`
      SELECT COUNT(*) as count FROM quotations 
      WHERE customer_phone = ? 
        AND inquiry_status = '已答复'
        AND (user_viewed_at IS NULL OR user_viewed_at < updated_at)
    `, [phone]);
    
    res.json({ success: true, count: count[0].count || 0 });
  } catch (error) {
    console.error('获取未读回复数失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 用户标记询单为已查看
app.put('/api/quotations/mark-viewed', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: '缺少手机号' });
    }
    
    // 标记该用户的所有已答复询单为已查看
    await db.execute(`
      UPDATE quotations 
      SET user_viewed_at = CURRENT_TIMESTAMP 
      WHERE customer_phone = ? AND inquiry_status = '已答复'
    `, [phone]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('标记已查看失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取管理员未回复的询单数（简化版：只要是询价中就显示）
app.get('/api/quotations/unreplied-count', async (req, res) => {
  try {
    // 查询：所有询价中的询单数量
    const count = await db.query(`
      SELECT COUNT(*) as count FROM quotations 
      WHERE inquiry_status = '询价中'
    `);
    
    res.json({ success: true, count: count[0].count || 0 });
  } catch (error) {
    console.error('获取未回复询单数失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 管理员标记询单为已查看
app.put('/api/quotations/mark-admin-viewed', async (req, res) => {
  try {
    // 标记所有询价中的询单为管理员已查看
    await db.execute(`
      UPDATE quotations 
      SET admin_viewed_at = CURRENT_TIMESTAMP 
      WHERE inquiry_status = '询价中'
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error('标记管理员已查看失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取报价单列表
app.get('/api/quotations', async (req, res) => {
  try {
    const quotations = await db.query('SELECT * FROM quotations ORDER BY created_at DESC');
    
    // 为每个订单加载商品明细
    for (const quote of quotations) {
      const items = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [quote.id]);
      quote.items = items;
    }
    
    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新报价单
app.put('/api/quotations/:id', async (req, res) => {
  try {
    const { inquiry_status, original_total, discount_amount, final_total } = req.body;
    
    const fields = [];
    const values = [];
    
    if (inquiry_status !== undefined) {
      fields.push('inquiry_status = ?');
      values.push(inquiry_status);
    }
    if (original_total !== undefined) {
      fields.push('original_total = ?');
      values.push(original_total);
    }
    if (discount_amount !== undefined) {
      fields.push('discount_amount = ?');
      values.push(discount_amount);
    }
    if (final_total !== undefined) {
      fields.push('final_total = ?');
      values.push(final_total);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: '没有提供要更新的字段' });
    }
    
    values.push(req.params.id);
    
    await db.execute(
      `UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新报价单项
app.put('/api/quotation-items/:id', async (req, res) => {
  try {
    const { original_price, modified_price, original_subtotal, modified_subtotal } = req.body;
    
    const fields = [];
    const values = [];
    
    if (original_price !== undefined) {
      fields.push('original_price = ?');
      values.push(original_price);
    }
    if (modified_price !== undefined) {
      fields.push('modified_price = ?');
      values.push(modified_price);
    }
    if (original_subtotal !== undefined) {
      fields.push('original_subtotal = ?');
      values.push(original_subtotal);
    }
    if (modified_subtotal !== undefined) {
      fields.push('modified_subtotal = ?');
      values.push(modified_subtotal);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: '没有提供要更新的字段' });
    }
    
    values.push(req.params.id);
    
    await db.execute(
      `UPDATE quotation_items SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除报价单
app.delete('/api/quotations/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM quotation_items WHERE quotation_id = ?', [req.params.id]);
    await db.execute('DELETE FROM quotations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 上传商品图片
const fs = require('fs');

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '未上传文件' });
    }
    
    // 上传到项目public目录
    const srcPath = path.join(__dirname, '../public/uploads', req.file.filename);
    
    // 同时复制到nginx部署目录
    const destDir = '/var/www/quotation-system-3002/uploads';
    const destPath = path.join(destDir, req.file.filename);
    
    // 确保目标目录存在
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // 复制文件到部署目录
    fs.copyFileSync(srcPath, destPath);
    
    res.json({ 
      success: true, 
      data: { 
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename
      } 
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建商品
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id, stock_status, specs, model, images, detail_html } = req.body;
    let image_urls = null;
    
    // 支持多图：优先使用images字段（JSON数组），其次使用单张上传
    if (images) {
      try {
        image_urls = JSON.parse(images);
      } catch (e) {
        image_urls = [images];
      }
    } else if (req.file) {
      image_urls = [`/uploads/${req.file.filename}`];
    }
    
    const productId = await db.execute(`
      INSERT INTO products (name, description, price, category_id, image_url, stock_status, specs, model, detail_html)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, 
      description || null, 
      price, 
      category_id || null, 
      image_urls ? JSON.stringify(image_urls) : null, 
      stock_status || '有货', 
      specs || null, 
      model || null,
      detail_html || null
    ]);
    
    const products = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新商品
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category_id, stock_status, specs, model, images, detail_html } = req.body;
    
    // 获取当前商品信息
    const existingProducts = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProducts.length) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    
    const existingProduct = existingProducts[0];
    let image_urls = existingProduct.image_url;
    
    // 如果上传了新图片，添加到图片数组
    if (req.file) {
      try {
        const existing = existingProduct.image_url ? JSON.parse(existingProduct.image_url) : [];
        image_urls = JSON.stringify([...existing, `/uploads/${req.file.filename}`]);
      } catch (e) {
        image_urls = JSON.stringify([`/uploads/${req.file.filename}`]);
      }
    } else if (images !== undefined) {
      // 如果body里传了images，使用它（JSON数组格式）
      try {
        image_urls = JSON.parse(images);
      } catch (e) {
        image_urls = images;
      }
    }
    
    await db.execute(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock_status = ?, specs = ?, model = ?, detail_html = ?
      WHERE id = ?
    `, [
      name || existingProduct.name, 
      description !== undefined ? description : existingProduct.description, 
      price !== undefined ? price : existingProduct.price, 
      category_id !== undefined ? (category_id || null) : existingProduct.category_id, 
      image_urls, 
      stock_status !== undefined ? stock_status : (existingProduct.stock_status || '有货'), 
      specs !== undefined ? specs : existingProduct.specs, 
      model !== undefined ? model : existingProduct.model,
      detail_html !== undefined ? detail_html : existingProduct.detail_html,
      productId
    ]);
    
    const products = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除商品
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // 检查商品是否存在
    const products = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!products.length) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    
    // 删除商品
    await db.execute('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 目录商品管理 API ============

// 获取目录下的商品
app.get('/api/categories/:id/products', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await db.query(
      "SELECT * FROM products WHERE category_id = ? ORDER BY id",
      [categoryId]
    );
    // 即使没有商品也返回成功，data为空数组
    res.json({ success: true, data: products || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取未分配目录的商品（注意：这个路由要放在 /api/products/:id 之前！）
app.get('/api/unassigned-products', async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM products WHERE category_id IS NULL ORDER BY id"
    );
    // 即使没有商品也返回成功，data为空数组
    res.json({ success: true, data: products || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量添加商品到目录
app.post('/api/categories/:id/products', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ success: false, error: '请提供商品ID列表' });
    }
    
    // 获取目录信息（用于生成商品号）
    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    const category = categories[0];
    if (!category) {
      return res.status(404).json({ success: false, error: '目录不存在' });
    }
    
    // 获取该目录下当前最大的商品号序号
    const maxResult = await db.query(
      "SELECT MAX(product_no) as max_no FROM products WHERE category_id = ?",
      [categoryId]
    );
    let maxSeq = 0;
    if (maxResult[0].max_no) {
      const match = maxResult[0].max_no.match(/-(\d+)$/);
      if (match) {
        maxSeq = parseInt(match[1]);
      }
    }
    
    // 批量更新商品
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      maxSeq++;
      const productNo = `${category.abbreviation}-${maxSeq.toString().padStart(3, '0')}`;
      
      await db.execute(
        "UPDATE products SET category_id = ?, product_no = ? WHERE id = ?",
        [categoryId, productNo, productId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量移除商品从目录
app.delete('/api/categories/:id/products', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ success: false, error: '请提供商品ID列表' });
    }
    
    // 批量更新商品（清空category_id和product_no）
    for (const productId of productIds) {
      await db.execute(
        "UPDATE products SET category_id = NULL, product_no = NULL WHERE id = ?",
        [productId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 询单提醒 API ============

// 获取用户未读回复的询单数
app.get('/api/quotations/unread-count', async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) {
      return res.json({ success: true, count: 0 });
    }
    
    // 查询：已答复且用户未查看（或最后查看时间早于更新时间）
    const count = await db.query(`
      SELECT COUNT(*) as count FROM quotations 
      WHERE customer_phone = ? 
        AND inquiry_status = '已答复'
        AND (user_viewed_at IS NULL OR user_viewed_at < updated_at)
    `, [phone]);
    
    res.json({ success: true, count: count[0].count || 0 });
  } catch (error) {
    console.error('获取未读回复数失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 用户标记询单为已查看
app.put('/api/quotations/mark-viewed', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: '缺少手机号' });
    }
    
    // 标记该用户的所有已答复询单为已查看
    await db.execute(`
      UPDATE quotations 
      SET user_viewed_at = CURRENT_TIMESTAMP 
      WHERE customer_phone = ? AND inquiry_status = '已答复'
    `, [phone]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('标记已查看失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取管理员未回复的询单数（简化版：只要是询价中就显示）
app.get('/api/quotations/unreplied-count', async (req, res) => {
  try {
    // 查询：所有询价中的询单数量
    const count = await db.query(`
      SELECT COUNT(*) as count FROM quotations 
      WHERE inquiry_status = '询价中'
    `);
    
    res.json({ success: true, count: count[0].count || 0 });
  } catch (error) {
    console.error('获取未回复询单数失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 管理员标记询单为已查看
app.put('/api/quotations/mark-admin-viewed', async (req, res) => {
  try {
    // 标记所有询价中的询单为管理员已查看
    await db.execute(`
      UPDATE quotations 
      SET admin_viewed_at = CURRENT_TIMESTAMP 
      WHERE inquiry_status = '询价中'
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error('标记管理员已查看失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
async function start() {
  await db.initDatabase();
  
  // 给现有表添加新字段（如果不存在）
  try {
    // 检查字段是否已存在
    const columns = await db.query(`SHOW COLUMNS FROM quotations LIKE 'user_viewed_at'`);
    if (columns.length === 0) {
      await db.execute('ALTER TABLE quotations ADD COLUMN user_viewed_at DATETIME');
    }
    const columns2 = await db.query(`SHOW COLUMNS FROM quotations LIKE 'admin_viewed_at'`);
    if (columns2.length === 0) {
      await db.execute('ALTER TABLE quotations ADD COLUMN admin_viewed_at DATETIME');
    }
    console.log('✅ 数据库字段检查完成');
  } catch (error) {
    console.log('数据库字段检查异常:', error.message);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 报价系统后端运行在 http://localhost:${PORT}`);
  });
}

start();

