<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 bg-white border-b z-50 px-4 py-3">
        <Breadcrumb 
          :breadcrumbs="[
            { label: '首页', to: '/' },
            { label: '店铺管理' }
          ]"
        />
      </div>

      <div class="p-6">
        <!-- 功能菜单 -->
        <div class="space-y-2">
          <button 
            @click="$router.push('/shop-info-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m2 0h10a2 2 0 012 2H9m2 4h10a2 2 0 012 2v-3a2 2 0 01-2-2h-2M9 5a2 2 0 00-2-2v-3a2 2 0 012 2z"/>
              </svg>
              店铺信息管理
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            @click="$router.push('/category-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              目录管理
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            @click="$router.push('/product-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              商品管理
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            @click="$router.push('/inquiry-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0h4"/>
              </svg>
              <span class="flex items-center gap-1.5">
                询价单管理
                <span v-if="unrepliedCount > 0" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full leading-none">
                  {{ unrepliedCount > 99 ? '99+' : unrepliedCount }}
                </span>
              </span>
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            @click="$router.push('/user-manage')"
            class="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              用户管理
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import axios from 'axios'
import Breadcrumb from '../components/Breadcrumb.vue'

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

onMounted(() => {
  loadUnrepliedCount()
})

onActivated(() => {
  loadUnrepliedCount()
})
</script>
