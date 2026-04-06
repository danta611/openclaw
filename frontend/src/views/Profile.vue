<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-gray-50 px-4 py-3 border-b">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '我的' }
          ]"
          :show-back="false"
        />
      </div>

      <div class="p-6">
        <!-- 用户信息 -->
        <div class="flex items-start gap-4 mb-8">
          <div 
            @click="isLoggedIn && $router.push('/profile-edit')" 
            class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80"
            :class="isAdmin ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'"
          >
            <img 
              v-if="userAvatar && isLoggedIn" 
              :src="userAvatar" 
              class="w-full h-full object-cover"
            />
            <span v-else>
              {{ isAdmin ? '管' : userNickname ? userNickname.charAt(0) : '客' }}
            </span>
          </div>
          <div 
            @click="isLoggedIn && $router.push('/profile-edit')" 
            class="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-lg -ml-2 -mr-2 -mt-2 -mb-2 p-2"
          >
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-800">
                {{ isLoggedIn ? (userNickname || (isAdmin ? '管理员' : '客户')) : '访客用户' }}
              </h2>
              <span v-if="isLoggedIn" :class="['px-2 py-0.5 rounded text-xs font-medium flex-shrink-0', levelBadgeClass]">
                {{ levelIcon }} {{ levelLabel }}
              </span>
            </div>
            <p v-if="isLoggedIn && userCarModel" class="text-sm text-gray-500 mt-0.5">
              座驾：{{ userCarModel }}
            </p>
            <p v-if="isLoggedIn" class="text-sm text-gray-400 mt-0.5">
              账号：{{ maskedPhone }}
            </p>
            <p v-else class="text-sm text-gray-500 mt-1">
              欢迎光临～
            </p>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="space-y-2">
          <button 
            v-if="isLoggedIn"
            @click="$router.push('/settings')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              账号设置
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            v-else
            @click="$router.push('/settings')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              登录
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            v-if="isLoggedIn"
            @click="$router.push('/profile-edit')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              个人信息
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            v-if="isAdmin"
            @click="$router.push('/shop-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="flex items-center gap-1.5">
                店铺管理
                <span v-if="unrepliedCount > 0" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full leading-none">
                  {{ unrepliedCount > 99 ? '99+' : unrepliedCount }}
                </span>
              </span>
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              关于
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- 版本信息 -->
        <div class="mt-8 text-center text-sm text-gray-400">
          <p>车酷正品配件报价系统 v1.0.0</p>
          <p class="mt-1">© 2025 All Rights Reserved</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { getUserLevel, getLevelBadgeClass, getLevelLabel, getLevelIcon } from '../utils/userLevels'
import Breadcrumb from '../components/Breadcrumb.vue'

const { isAdmin, isLoggedIn } = useAuthStore()

const userAvatar = ref('')
const userNickname = ref('')
const userCarModel = ref('')

// 未回复询单数
const unrepliedCount = ref(0)

// 加载未回复询单数
async function loadUnrepliedCount() {
  try {
    const response = await axios.get('/api/quotations/unreplied-count')
    if (response.data.success) {
      unrepliedCount.value = response.data.count
    }
  } catch (error) {
    console.error('加载未回复询单数失败:', error)
  }
}

// 直接从localStorage读取userPhone
const userPhone = ref(localStorage.getItem('user_phone') || '')

// 等级相关
const userLevelValue = ref(0)
const currentLevel = computed(() => getUserLevel(userLevelValue.value))
const levelBadgeClass = computed(() => `bg-gradient-to-br ${currentLevel.value.badge} text-white`)
const levelLabel = computed(() => `${currentLevel.value.shortLabel} ${currentLevel.value.label}`)
const levelIcon = computed(() => currentLevel.value.icon)

// 手机号打码显示
const maskedPhone = computed(() => {
  if (!userPhone.value || userPhone.value.length !== 11) {
    return userPhone.value
  }
  return userPhone.value.substring(0, 3) + '****' + userPhone.value.substring(7)
})

// 从后端加载用户信息
async function loadUserProfile() {
  const phone = localStorage.getItem('user_phone')
  console.log('Profile.vue: loadUserProfile, phone:', phone)
  
  if (phone) {
    try {
      const response = await axios.get(`/api/users/${phone}`)
      console.log('Profile.vue: API response:', response.data)
      if (response.data.success) {
        const user = response.data.data
        userAvatar.value = user.avatar || ''
        userNickname.value = user.nickname || ''
        userLevelValue.value = user.level !== undefined ? Number(user.level) : 0
        userCarModel.value = user.car_model || ''
        console.log('Profile.vue: userLevel set to', userLevelValue.value)
      }
    } catch (error) {
      console.error('从后端加载用户信息失败:', error)
    }
  }
}

onMounted(() => {
  userPhone.value = localStorage.getItem('user_phone') || ''
  console.log('Profile.vue: onMounted, userPhone:', userPhone.value)
  loadUserProfile()
  if (isAdmin) {
    loadUnrepliedCount()
  }
})

onActivated(() => {
  userPhone.value = localStorage.getItem('user_phone') || ''
  console.log('Profile.vue: onActivated, userPhone:', userPhone.value)
  loadUserProfile()
  if (isAdmin) {
    loadUnrepliedCount()
  }
})
</script>
