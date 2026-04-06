<template>
  <div id="app">
    <!-- 顶部 Header（仅目录页和我的页面显示） -->
    <header v-if="$route.path === '/' || $route.path === '/profile'" class="bg-white border-b sticky top-0 z-50">
      <div class="px-4 py-3">
        <div class="flex items-start gap-3">
          <!-- 左侧：Logo -->
          <div class="w-[90px] h-[90px] flex-shrink-0 -ml-2">
            <img 
              v-if="shopInfo.logo" 
              :src="shopInfo.logo" 
              alt="Logo" 
              class="w-full h-full object-contain"
              @error="shopInfo.logo = null"
            />
            <img 
              v-else 
              src="./assets/logo.jpg" 
              alt="Logo" 
              class="w-full h-full object-contain"
            />
          </div>
          
          <!-- 中间：标题 + 副标题 -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <!-- 主标题 -->
              <h1 class="text-lg font-bold text-gray-800 leading-tight">{{ shopInfo.name }}</h1>
              
              <!-- 右上角：微信和手机图标 -->
              <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                <button 
                  @click="copyWechat"
                  class="w-8 h-8 flex items-center justify-center bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors"
                  title="复制微信号"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.008-.27-.028-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </button>
                <button 
                  @click="copyPhone"
                  class="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
                  title="复制手机号"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 副标题 -->
            <p class="text-xs text-gray-500 mt-2 line-clamp-4">{{ shopInfo.description }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="min-h-screen">
      <router-view />
    </main>

    <!-- 底部导航栏（询价单详情页、商品管理页和询单管理页不显示） -->
    <nav v-if="!$route.path.startsWith('/inquiry/') && !$route.path.startsWith('/product-manage') && $route.path !== '/inquiry-manage'" class="tab-bar">
      <router-link to="/" class="tab-item" active-class="active">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
        <span>目录</span>
      </router-link>
      <router-link to="/purchase" class="tab-item" active-class="active">
        <div class="relative">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span v-if="totalItems > 0" class="absolute -top-1 -right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {{ totalItems > 99 ? '99+' : totalItems }}
          </span>
        </div>
        <span>采购车</span>
      </router-link>
      <router-link to="/inquiries" class="tab-item" active-class="active">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <span>询价单</span>
      </router-link>
      <router-link to="/profile" class="tab-item" active-class="active">
        <div class="relative">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span v-if="isAdmin && unrepliedCount > 0" class="absolute -top-1 -right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {{ unrepliedCount > 99 ? '99+' : unrepliedCount }}
          </span>
        </div>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { usePurchaseStore } from './stores/purchase'
import { useAuthStore } from './stores/auth'
import axios from 'axios'

const purchaseStore = usePurchaseStore()
const { isAdmin } = useAuthStore()

// 管理员未回复询单数
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

// 店铺信息
const shopInfo = ref({
  name: '正品配件商城',
  description: '配件批发零售。配备专业师傅，承接车辆美容，方案设计，个性组配，维修保养。',
  phone: '15889339863',
  wechat: 'AYW6998',
  logo: null
})

// 计算采购车商品总数
const totalItems = computed(() => {
  return purchaseStore.items.reduce((sum, item) => sum + item.quantity, 0)
})

const WECHAT_ID = 'AYW6998'
const PHONE_NUMBER = '15889339863'

// 加载店铺信息
async function loadShopInfo() {
  try {
    const response = await axios.get('/api/shop-info')
    console.log('📥 店铺信息API返回:', response.data)
    if (response.data.success && response.data.data) {
      shopInfo.value = {
        name: response.data.data.name || '正品配件商城',
        description: response.data.data.description || '配件批发零售。配备专业师傅，承接车辆美容，方案设计，个性组配，维修保养。',
        phone: response.data.data.phone || '15889339863',
        wechat: response.data.data.wechat || 'AYW6998',
        logo: response.data.data.logo || null
      }
      console.log('✅ 店铺信息已加载:', shopInfo.value)
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
  }
}

// 显示 Toast 提示
function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg z-50 text-sm'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 1500)
}

// 复制微信号
async function copyWechat() {
  try {
    await navigator.clipboard.writeText(WECHAT_ID)
    showToast('✓ 微信号已复制')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = WECHAT_ID
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('✓ 微信号已复制')
  }
}

// 复制手机号
async function copyPhone() {
  try {
    await navigator.clipboard.writeText(PHONE_NUMBER)
    showToast('✓ 手机号已复制')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = PHONE_NUMBER
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('✓ 手机号已复制')
  }
}

onMounted(() => {
  purchaseStore.loadCart()
  loadShopInfo()
  if (isAdmin) {
    loadUnrepliedCount()
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
