// 数据管理模块：处理数据同步和老化

// 数据版本（用于迁移）
const DATA_VERSION = '1.0'

// 旧表名列表（需要老化的）
const OLD_TABLES = [
  // 这里记录需要清理的旧表名
  // 'old_table_name',
]

// 数据同步：确保 registered_users 和 profile 数据一致
function syncUserData() {
  console.log('[DataManager] 开始同步用户数据...')
  
  // 初始化特定账号的等级（只在没有数据时设置）
  initAccountLevel('18218361198', 2) // L2: 御风骑手
  initAccountLevel('15889339863', 4) // L4: 万里尊骑
  initAccountLevel('18124666369', 5) // L5: 苍穹圣骑
  
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]')
  
  // 1. 为每个注册用户确保有 profile 数据
  registeredUsers.forEach(user => {
    const profileKey = `profile_${user.phone}`
    const existingProfile = localStorage.getItem(profileKey)
    
    if (!existingProfile) {
      // 创建默认 profile
      const defaultProfile = {
        avatar: '',
        nickname: '',
        identity: '车友',
        level: getDefaultLevel(user.phone),
        wechat: '',
        carModel: ''
      }
      localStorage.setItem(profileKey, JSON.stringify(defaultProfile))
      console.log(`[DataManager] 为用户 ${user.phone} 创建默认 profile`)
    } else {
      // 确保 profile 有 level 字段
      const profile = JSON.parse(existingProfile)
      if (profile.level === undefined) {
        profile.level = getDefaultLevel(user.phone)
        localStorage.setItem(profileKey, JSON.stringify(profile))
        console.log(`[DataManager] 为用户 ${user.phone} 补充 level 字段`)
      }
    }
  })
  
  console.log('[DataManager] 用户数据同步完成')
}

// 初始化指定账号的等级（始终覆盖，确保正确）
function initAccountLevel(phone, level) {
  const profileKey = `profile_${phone}`
  let data = {}
  
  try {
    const existing = localStorage.getItem(profileKey)
    if (existing) {
      data = JSON.parse(existing)
    }
  } catch (e) {}
  
  data.level = level
  localStorage.setItem(profileKey, JSON.stringify(data))
  console.log(`[DataManager] 设置账号 ${phone} 等级为 ${level}`)
}

// 设置指定账号的等级
function setAccountLevel(phone, level) {
  const profileKey = `profile_${phone}`
  const existingProfile = localStorage.getItem(profileKey)
  
  if (existingProfile) {
    const profile = JSON.parse(existingProfile)
    if (profile.level === undefined) {
      profile.level = level
      localStorage.setItem(profileKey, JSON.stringify(profile))
      console.log(`[DataManager] 设置账号 ${phone} 等级为 ${level}`)
    }
  } else {
    const defaultProfile = {
      avatar: '',
      nickname: '',
      identity: '车友',
      level: level,
      wechat: '',
      carModel: ''
    }
    localStorage.setItem(profileKey, JSON.stringify(defaultProfile))
    console.log(`[DataManager] 为账号 ${phone} 创建 profile 并设置等级为 ${level}`)
  }
}

// 根据手机号获取默认等级
function getDefaultLevel(phone) {
  if (phone === '18218361198') return 2 // L2: 御风骑手
  if (phone === '15889339863') return 4 // L4: 万里尊骑
  if (phone === '18124666369') return 5 // L5: 苍穹圣骑
  return 1 // 注册用户默认 L1
}

// 数据老化：清理旧表和过期数据
function cleanupOldData() {
  console.log('[DataManager] 开始清理旧数据...')
  
  // 1. 清理指定的旧表
  OLD_TABLES.forEach(tableName => {
    if (localStorage.getItem(tableName) !== null) {
      localStorage.removeItem(tableName)
      console.log(`[DataManager] 清理旧表: ${tableName}`)
    }
  })
  
  // 2. 清理没有对应注册用户的 profile（孤儿数据）
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]')
  const registeredPhones = new Set(registeredUsers.map(u => u.phone))
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('profile_')) {
      const phone = key.replace('profile_', '')
      // 如果不在注册用户列表中，且不是管理员账号，则删除
      if (!registeredPhones.has(phone) && 
          phone !== '18218361198' && 
          phone !== '15889339863' && 
          phone !== '18124666369') {
        localStorage.removeItem(key)
        console.log(`[DataManager] 清理孤儿 profile: ${key}`)
      }
    }
  }
  
  console.log('[DataManager] 旧数据清理完成')
}

// 检查数据版本，必要时迁移
function checkDataVersion() {
  const currentVersion = localStorage.getItem('data_version')
  if (currentVersion !== DATA_VERSION) {
    console.log(`[DataManager] 数据版本更新: ${currentVersion || 'none'} -> ${DATA_VERSION}`)
    localStorage.setItem('data_version', DATA_VERSION)
    // 这里可以添加迁移逻辑
    syncUserData()
  }
}

// 初始化数据管理器
function initDataManager() {
  console.log('[DataManager] 初始化...')
  
  // 打印所有 profile 数据
  console.log('=== 所有账号等级数据 ===')
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('profile_')) {
      console.log(key + ':', localStorage.getItem(key))
    }
  }
  console.log('========================')
  
  // 直接设置这三个账号的等级数据
  forceSetAccountLevel('18218361198', 2)
  forceSetAccountLevel('15889339863', 4)
  forceSetAccountLevel('18124666369', 5)
  
  checkDataVersion()
  syncUserData()
  cleanupOldData()
}

// 强制设置指定账号的等级（始终覆盖）
function forceSetAccountLevel(phone, level) {
  const profileKey = `profile_${phone}`
  let data = {}
  
  try {
    const existing = localStorage.getItem(profileKey)
    if (existing) {
      data = JSON.parse(existing)
    }
  } catch (e) {}
  
  data.level = level
  localStorage.setItem(profileKey, JSON.stringify(data))
  console.log(`[DataManager] 强制设置账号 ${phone} 等级为 ${level}`)
}

// 确保特定账号等级正确
function ensureAccountLevels() {
  const levelMap = {
    '18218361198': 2,
    '15889339863': 4,
    '18124666369': 5
  }
  
  Object.keys(levelMap).forEach(phone => {
    const key = `profile_${phone}`
    const level = levelMap[phone]
    let data = {}
    
    try {
      const existing = localStorage.getItem(key)
      if (existing) {
        data = JSON.parse(existing)
      }
    } catch (e) {}
    
    data.level = level
    localStorage.setItem(key, JSON.stringify(data))
    console.log(`[DataManager] 确保账号 ${phone} 等级为 ${level}`)
  })
}

// 导出
export {
  initDataManager,
  syncUserData,
  cleanupOldData,
  getDefaultLevel,
  setAccountLevel,
  ensureAccountLevels
}
