// 用户等级配置
export const USER_LEVELS = [
  {
    level: 0,
    label: '路人骑友',
    shortLabel: 'L0',
    icon: '⚪',
    badge: 'from-gray-400 to-gray-500',
    desc: ''
  },
  {
    level: 1,
    label: '追风骑友',
    shortLabel: 'L1',
    icon: '🌿',
    badge: 'from-green-400 to-emerald-600',
    desc: ''
  },
  {
    level: 2,
    label: '御风骑手',
    shortLabel: 'L2',
    icon: '💎',
    badge: 'from-blue-400 to-blue-600',
    desc: ''
  },
  {
    level: 3,
    label: '凌云骑士',
    shortLabel: 'L3',
    icon: '🗡️',
    badge: 'from-purple-400 to-purple-600',
    desc: ''
  },
  {
    level: 4,
    label: '万里尊骑',
    shortLabel: 'L4',
    icon: '👑',
    badge: 'from-amber-400 to-orange-600',
    desc: ''
  },
  {
    level: 5,
    label: '苍穹圣骑',
    shortLabel: 'L5',
    icon: '✨',
    badge: 'from-rose-400 to-pink-600',
    desc: ''
  }
]

// 根据等级获取等级信息
export function getUserLevel(level) {
  const levelNum = Number(level) || 0
  return USER_LEVELS.find(l => l.level === levelNum) || USER_LEVELS[0]
}

// 获取等级徽章样式类
export function getLevelBadgeClass(level) {
  return getUserLevel(level).badge
}

// 获取等级标签（L0 路人骑友）
export function getLevelLabel(level) {
  const levelInfo = getUserLevel(level)
  return `${levelInfo.shortLabel} ${levelInfo.label}`
}

// 获取等级图标
export function getLevelIcon(level) {
  return getUserLevel(level).icon
}
