<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '我的', to: '/profile' },
            { label: '账号设置' }
          ]"
        />
      </div>

      <div class="p-6">
        <!-- 已登录状态 -->
        <div v-if="isLoggedIn" class="space-y-4">
          <div class="flex items-center gap-3 p-4" :class="isAdmin ? 'bg-orange-50' : 'bg-blue-50'">
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                isAdmin ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
              ]"
            >
              {{ isAdmin ? '管' : '客' }}
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ isAdmin ? '已登录管理员' : '已登录客户' }}</p>
              <p class="text-sm text-gray-500">{{ userPhone }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            退出登录
          </button>
        </div>

        <!-- 未登录状态 -->
        <div v-if="!isLoggedIn">
          <!-- 登录/注册切换 -->
          <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button 
              @click="mode = 'login'"
              :class="[
                'flex-1 py-2 rounded-md font-medium transition-colors',
                mode === 'login' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              ]"
            >
              登录
            </button>
            <button 
              @click="mode = 'register'"
              :class="[
                'flex-1 py-2 rounded-md font-medium transition-colors',
                mode === 'register' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              ]"
            >
              注册
            </button>
          </div>

          <!-- 登录表单 -->
          <div v-if="mode === 'login'" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">手机号</label>
              <input 
                v-model="loginPhone" 
                type="tel" 
                placeholder="请输入手机号"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">密码</label>
              <input 
                v-model="loginPassword" 
                type="password" 
                placeholder="请输入密码"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</div>
            <button 
              @click="handleLogin"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              登录
            </button>
          </div>

          <!-- 注册表单 -->
          <div v-if="mode === 'register'" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">手机号 <span class="text-red-500">*</span></label>
              <input 
                v-model="registerPhone" 
                type="tel" 
                placeholder="请输入手机号"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-2">年龄 <span class="text-red-500">*</span></label>
              <div class="flex gap-3">
                <label class="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    v-model="ageOption" 
                    type="radio" 
                    value="adult"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="text-gray-800">已满18岁</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    v-model="ageOption" 
                    type="radio" 
                    value="minor"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="text-gray-800">未满18岁</span>
                </label>
              </div>
            </div>
            <!-- 未成年需要家长联系方式 -->
            <div v-if="ageOption === 'minor'">
              <label class="block text-sm text-gray-600 mb-1">家长联系方式 <span class="text-red-500">*</span></label>
              <input 
                v-model="parentContact" 
                type="tel" 
                placeholder="请输入家长手机号"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">密码 <span class="text-red-500">*</span></label>
              <input 
                v-model="registerPassword" 
                type="password" 
                placeholder="请输入密码"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">确认密码 <span class="text-red-500">*</span></label>
              <input 
                v-model="registerConfirmPassword" 
                type="password" 
                placeholder="请再次输入密码"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div v-if="registerErrorMessage" class="text-red-500 text-sm">{{ registerErrorMessage }}</div>
            <button 
              @click="handleRegister"
              class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              注册
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import Breadcrumb from '../components/Breadcrumb.vue'

const router = useRouter()
const { isAdmin, isLoggedIn, userPhone, login, register, logout } = useAuthStore()

// 模式切换：login/register
const mode = ref('login')

// 登录表单
const loginPhone = ref('')
const loginPassword = ref('')
const errorMessage = ref('')

// 注册表单
const registerPhone = ref('')
const ageOption = ref('adult')
const parentContact = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const registerErrorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  try {
    const response = await axios.post('/api/login', {
      phone: loginPhone.value,
      password: loginPassword.value
    })
    if (response.data.success) {
      // 登录成功，设置localStorage
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_is_admin', response.data.data.is_admin ? 'true' : 'false')
      localStorage.setItem('user_phone', loginPhone.value)
      
      // 登录成功提示（短暂显示）
      const toast = document.createElement('div')
      toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
      toast.textContent = '✓ 登录成功'
      document.body.appendChild(toast)
      
      // 清空表单
      loginPhone.value = ''
      loginPassword.value = ''
      
      // 立即返回上一页
      setTimeout(() => {
        toast.remove()
        router.back()
      }, 300)
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || '登录失败，请稍后重试'
  }
}

async function handleRegister() {
  registerErrorMessage.value = ''
  
  // 验证手机号
  if (!registerPhone.value) {
    registerErrorMessage.value = '请输入手机号'
    return
  }
  if (registerPhone.value.length !== 11) {
    registerErrorMessage.value = '手机号必须是11位'
    return
  }
  
  // 验证年龄
  if (!ageOption.value) {
    registerErrorMessage.value = '请选择年龄'
    return
  }
  // 未成年需要家长联系方式
  if (ageOption.value === 'minor') {
    if (!parentContact.value) {
      registerErrorMessage.value = '请输入家长联系方式'
      return
    }
    if (parentContact.value.length !== 11) {
      registerErrorMessage.value = '家长联系方式必须是11位'
      return
    }
  }
  
  // 验证密码
  if (!registerPassword.value) {
    registerErrorMessage.value = '请输入密码'
    return
  }
  
  // 验证确认密码
  if (registerPassword.value !== registerConfirmPassword.value) {
    registerErrorMessage.value = '两次输入的密码不一致'
    return
  }
  
  try {
    // 调用后端注册API
    const response = await axios.post('/api/register', {
      phone: registerPhone.value,
      password: registerPassword.value,
      age: ageOption.value,
      parentContact: parentContact.value
    })
    
    if (response.data.success) {
      // 注册成功，设置localStorage
      localStorage.setItem('user_logged_in', 'true')
      localStorage.setItem('user_is_admin', response.data.data.is_admin ? 'true' : 'false')
      localStorage.setItem('user_phone', registerPhone.value)
      
      // 注册成功提示
      const toast = document.createElement('div')
      toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
      toast.textContent = '✓ 注册成功，已自动登录'
      document.body.appendChild(toast)
      
      // 清空表单
      registerPhone.value = ''
      ageOption.value = 'adult'
      parentContact.value = ''
      registerPassword.value = ''
      registerConfirmPassword.value = ''
      
      // 立即返回上一页
      setTimeout(() => {
        toast.remove()
        router.back()
      }, 300)
    }
  } catch (error) {
    registerErrorMessage.value = error.response?.data?.error || '注册失败，请稍后重试'
  }
}

function handleLogout() {
  logout()
}
</script>
