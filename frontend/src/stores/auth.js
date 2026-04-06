import { ref, computed } from 'vue'

// 管理员账号配置
const ADMIN_ACCOUNTS = [
  { phone: '18124666369', password: '699' },
  { phone: '15889339863', password: '699' }
]

// 存储注册用户（模拟数据库）
const registeredUsers = ref(JSON.parse(localStorage.getItem('registered_users') || '[]'))

export function useAuthStore() {
  // 从 localStorage 加载登录状态（每次调用store时重新加载）
  const isLoggedIn = ref(localStorage.getItem('user_logged_in') === 'true')
  const isAdmin = ref(localStorage.getItem('user_is_admin') === 'true')
  const userPhone = ref(localStorage.getItem('user_phone') || '')
  
  // 检查是否是管理员
  const isAdminUser = computed(() => isAdmin.value)
  
  // 检查是否已登录（客户或管理员）
  const isLoggedInUser = computed(() => isLoggedIn.value)

  // 登录
  function login(phone, password) {
    // 检查是否是管理员
    const adminAccount = ADMIN_ACCOUNTS.find(acc => acc.phone === phone && acc.password === password)
    if (adminAccount) {
      isLoggedIn.value = true
      isAdmin.value = true
      userPhone.value = phone
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_is_admin', 'true')
      localStorage.setItem('user_phone', phone)
      return { success: true, isAdmin: true }
    }
    
    // 检查是否是注册客户
    const user = registeredUsers.value.find(u => u.phone === phone && u.password === password)
    if (user) {
      isLoggedIn.value = true
      isAdmin.value = false
      userPhone.value = phone
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_is_admin', 'false')
      localStorage.setItem('user_phone', phone)
      return { success: true, isAdmin: false }
    }
    
    return { success: false, error: '手机号或密码错误' }
  }

  // 注册
  function register(phone, password, age, parentContact) {
    // 检查手机号是否已注册
    const existingUser = registeredUsers.value.find(u => u.phone === phone)
    if (existingUser) {
      return { success: false, error: '该手机号已注册，请直接登录' }
    }
    
    // 添加新用户
    const newUser = {
      phone,
      password,
      age,
      parentContact: parentContact || null,
      createdAt: new Date().toISOString()
    }
    registeredUsers.value.push(newUser)
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers.value))
    
    return { success: true }
  }

  // 登出
  function logout() {
    isLoggedIn.value = false
    isAdmin.value = false
    userPhone.value = ''
    localStorage.removeItem('user_logged_in')
    localStorage.removeItem('user_is_admin')
    localStorage.removeItem('user_phone')
  }

  return {
    isLoggedIn,
    isAdmin: isAdminUser,
    userPhone,
    login,
    register,
    logout
  }
}
